import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { InvoiceCreatedEmail } from "@/emails/InvoiceCreatedEmail";
import { ReminderBeforeDueEmail } from "@/emails/ReminderBeforeDueEmail";
import { OverdueEmail } from "@/emails/OverdueEmail";
import { computeNextPeriod } from "@/lib/recurrence";

// Daily cron entry point. Idempotent — safe to run more than once on
// the same day. Three jobs run in order:
//
//   1. Auto-generate next invoice for each active plan whose anchor's
//      cycle lands on today (and no invoice already exists for that
//      period).
//   2. Send "vence en N días" reminders for PENDING invoices that hit
//      one of the reminder offsets.
//   3. Mark PENDING invoices whose dueDate has passed as OVERDUE and
//      send an overdue email (once per invoice, gated by EmailLog).
//
// Auth: requires either `?secret=<CRON_SECRET>` in the query OR
// `Authorization: Bearer <CRON_SECRET>` header. If CRON_SECRET is not
// set in env, the endpoint refuses to run (fail-closed).
//
// Wiring on the VPS (crontab -e):
//   0 9 * * * curl -fsS "https://surcodia.com/api/cron/billing?secret=XXX" >/dev/null
// On Vercel: configure vercel.json crons + the auth header pattern.

const REMINDER_OFFSETS_DAYS = [3, 1, 0];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}
function portalInvoiceUrl(invoiceId: string) {
  return `${env.APP_URL.replace(/\/+$/, "")}/portal/invoice/${invoiceId}`;
}

function authorized(req: NextRequest): boolean {
  if (!env.CRON_SECRET) return false;
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("secret");
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  return queryToken === env.CRON_SECRET || bearer === env.CRON_SECRET;
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const results = {
    generated: 0,
    reminded: 0,
    markedOverdue: 0,
    overdueNotified: 0,
    errors: [] as string[],
  };

  // ── 1. Auto-generate today's invoice from active recurring plans ──
  try {
    const plans = await prisma.recurringPlan.findMany({
      where: { active: true, client: { active: true } },
      include: { client: true },
    });

    for (const plan of plans) {
      const next = computeNextPeriod(plan.frequency, plan.anchorDate, today);
      if (startOfDay(next.dueDate).getTime() !== today.getTime()) continue;

      // Skip if we already created an invoice for this dueDate.
      const existing = await prisma.invoice.findFirst({
        where: {
          clientId: plan.clientId,
          dueDate: { gte: next.dueDate, lt: addDays(next.dueDate, 1) },
        },
      });
      if (existing) continue;

      const created = await prisma.invoice.create({
        data: {
          clientId: plan.clientId,
          amountUsd: plan.amountUsd,
          description: plan.description,
          periodStart: next.periodStart,
          periodEnd: next.periodEnd,
          dueDate: next.dueDate,
          status: "PENDING",
        },
      });
      await sendEmail({
        kind: "INVOICE_CREATED",
        to: plan.client.email,
        subject: `Nueva factura — ${plan.description}`,
        template: InvoiceCreatedEmail({
          clientName: plan.client.fullName,
          description: plan.description,
          amountUsd: Number(plan.amountUsd),
          dueDate: created.dueDate,
          portalUrl: portalInvoiceUrl(created.id),
        }),
        invoiceId: created.id,
      });
      results.generated += 1;
    }
  } catch (e) {
    results.errors.push(`generate: ${(e as Error).message}`);
  }

  // ── 2. Send pre-due reminders ───────────────────────────────────────
  try {
    for (const offset of REMINDER_OFFSETS_DAYS) {
      const target = addDays(today, offset);
      const targetEnd = addDays(target, 1);
      const invoices = await prisma.invoice.findMany({
        where: {
          status: "PENDING",
          dueDate: { gte: target, lt: targetEnd },
        },
        include: { client: true },
      });

      for (const inv of invoices) {
        // Skip if a reminder for this offset was already sent today.
        const already = await prisma.emailLog.findFirst({
          where: {
            invoiceId: inv.id,
            kind: "REMINDER_BEFORE_DUE",
            sentAt: { gte: today },
          },
        });
        if (already) continue;

        await sendEmail({
          kind: "REMINDER_BEFORE_DUE",
          to: inv.client.email,
          subject: `Recordatorio: ${inv.description} vence ${
            offset === 0 ? "hoy" : offset === 1 ? "mañana" : `en ${offset} días`
          }`,
          template: ReminderBeforeDueEmail({
            clientName: inv.client.fullName,
            description: inv.description,
            amountUsd: Number(inv.amountUsd),
            dueDate: inv.dueDate,
            daysUntil: offset,
            portalUrl: portalInvoiceUrl(inv.id),
          }),
          invoiceId: inv.id,
        });
        results.reminded += 1;
      }
    }
  } catch (e) {
    results.errors.push(`reminders: ${(e as Error).message}`);
  }

  // ── 3. Mark overdue + notify ────────────────────────────────────────
  try {
    const newlyOverdue = await prisma.invoice.updateMany({
      where: {
        status: "PENDING",
        dueDate: { lt: today },
      },
      data: { status: "OVERDUE" },
    });
    results.markedOverdue = newlyOverdue.count;

    const overdueInvoices = await prisma.invoice.findMany({
      where: { status: "OVERDUE" },
      include: { client: true },
    });

    for (const inv of overdueInvoices) {
      // Notify at most once per invoice. (We could also cadence weekly
      // by relaxing this check, but one notification is the safer
      // default.)
      const already = await prisma.emailLog.findFirst({
        where: { invoiceId: inv.id, kind: "OVERDUE" },
      });
      if (already) continue;

      const daysOverdue = Math.max(1, daysBetween(inv.dueDate, today));
      await sendEmail({
        kind: "OVERDUE",
        to: inv.client.email,
        subject: `Factura vencida — ${inv.description}`,
        template: OverdueEmail({
          clientName: inv.client.fullName,
          description: inv.description,
          amountUsd: Number(inv.amountUsd),
          dueDate: inv.dueDate,
          daysOverdue,
          portalUrl: portalInvoiceUrl(inv.id),
        }),
        invoiceId: inv.id,
      });
      results.overdueNotified += 1;
    }
  } catch (e) {
    results.errors.push(`overdue: ${(e as Error).message}`);
  }

  return NextResponse.json({ ok: true, results });
}
