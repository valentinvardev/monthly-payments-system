import { z } from "zod";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  clientProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { computeNextPeriod } from "@/lib/recurrence";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { InvoiceCreatedEmail } from "@/emails/InvoiceCreatedEmail";

function portalInvoiceUrl(invoiceId: string) {
  return `${env.APP_URL.replace(/\/+$/, "")}/portal/invoice/${invoiceId}`;
}

export const invoicesRouter = createTRPCRouter({
  listAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.invoice.findMany({
      orderBy: { dueDate: "desc" },
      include: { client: true },
    });
  }),

  // What the cron would emit on its next pass: one row per active
  // recurring plan whose next dueDate doesn't have an Invoice yet.
  // Lets the admin preview / nudge upcoming bills without waiting for
  // the daily worker.
  upcomingBills: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const plans = await ctx.prisma.recurringPlan.findMany({
      where: {
        active: true,
        client: { active: true },
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      include: { client: true },
    });

    const rows = await Promise.all(
      plans.map(async (plan) => {
        const { periodStart, periodEnd, dueDate } = computeNextPeriod(
          plan.frequency,
          plan.anchorDate,
          now,
        );
        const existing = await ctx.prisma.invoice.findFirst({
          where: { clientId: plan.clientId, dueDate },
          select: { id: true },
        });
        if (existing) return null;
        return {
          planId: plan.id,
          clientId: plan.clientId,
          clientName: plan.client.fullName,
          description: plan.description,
          amountUsd: plan.amountUsd,
          frequency: plan.frequency,
          periodStart,
          periodEnd,
          dueDate,
        };
      }),
    );

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }),

  listMine: clientProcedure.query(({ ctx }) => {
    return ctx.prisma.invoice.findMany({
      where: { clientId: ctx.clientId },
      orderBy: { dueDate: "desc" },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.id },
        include: { client: true, payments: { orderBy: { createdAt: "desc" } } },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.user.role === "CLIENT") {
        const linked = await ctx.prisma.client.findUnique({
          where: { userId: ctx.user.id },
        });
        if (!linked || linked.id !== invoice.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }
      return invoice;
    }),

  generateNext: adminProcedure
    .input(z.object({ clientId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.prisma.client.findUnique({
        where: { id: input.clientId },
        include: { recurringPlan: true },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" });
      const plan = client.recurringPlan;
      if (!plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El cliente no tiene un plan recurrente cargado",
        });
      }

      const { periodStart, periodEnd, dueDate } = computeNextPeriod(
        plan.frequency,
        plan.anchorDate,
      );

      const invoice = await ctx.prisma.$transaction(async (tx) => {
        const created = await tx.invoice.create({
          data: {
            clientId: client.id,
            amountUsd: plan.amountUsd,
            description: plan.description,
            periodStart,
            periodEnd,
            dueDate,
            status: "PENDING",
          },
        });
        return created;
      });

      await sendEmail({
        kind: "INVOICE_CREATED",
        to: client.email,
        subject: `Nueva factura — ${plan.description}`,
        template: InvoiceCreatedEmail({
          clientName: client.fullName,
          description: plan.description,
          amountUsd: Number(plan.amountUsd),
          dueDate: invoice.dueDate,
          portalUrl: portalInvoiceUrl(invoice.id),
        }),
        invoiceId: invoice.id,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${input.clientId}`);
      return invoice;
    }),

  createOneOff: adminProcedure
    .input(
      z.object({
        clientId: z.string(),
        amountUsd: z.number().positive(),
        description: z.string().min(1),
        dueDate: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.prisma.client.findUnique({
        where: { id: input.clientId },
      });
      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" });
      }

      const due = new Date(input.dueDate);
      if (Number.isNaN(due.getTime())) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fecha de vencimiento inválida" });
      }

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();
      const status = due.getTime() < todayStart ? "OVERDUE" : "PENDING";

      const invoice = await ctx.prisma.$transaction(async (tx) => {
        const created = await tx.invoice.create({
          data: {
            clientId: client.id,
            amountUsd: input.amountUsd,
            description: input.description,
            // One-off invoices have no real period; use the dueDate as both
            // ends so the schema stays consistent.
            periodStart: due,
            periodEnd: due,
            dueDate: due,
            status,
          },
        });
        return created;
      });

      await sendEmail({
        kind: "INVOICE_CREATED",
        to: client.email,
        subject: `Nueva factura — ${input.description}`,
        template: InvoiceCreatedEmail({
          clientName: client.fullName,
          description: input.description,
          amountUsd: input.amountUsd,
          dueDate: invoice.dueDate,
          portalUrl: portalInvoiceUrl(invoice.id),
        }),
        invoiceId: invoice.id,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${input.clientId}`);
      return invoice;
    }),

  markPaid: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.update({
        where: { id: input.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${invoice.clientId}`);
      return invoice;
    }),

  // Hard-delete an invoice + any payments tied to it. Used to clean
  // out test invoices. Email-log rows are preserved (we just NULL out
  // their invoiceId) so the audit trail of what was sent and to whom
  // survives the deletion.
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.id },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.$transaction(async (tx) => {
        await tx.emailLog.updateMany({
          where: { invoiceId: input.id },
          data: { invoiceId: null },
        });
        await tx.payment.deleteMany({ where: { invoiceId: input.id } });
        await tx.invoice.delete({ where: { id: input.id } });
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${invoice.clientId}`);
      return { id: input.id, clientId: invoice.clientId };
    }),
});
