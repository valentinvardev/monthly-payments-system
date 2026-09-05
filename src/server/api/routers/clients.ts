import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/lib/env";
import { computeAllDueDatesFromAnchor } from "@/lib/recurrence";
import { sendEmail } from "@/lib/email";
import { InviteEmail } from "@/emails/InviteEmail";
import { createPasswordResetLink, sendPasswordResetEmail } from "@/lib/password-reset";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const clientInput = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export const clientsRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    const clients = await ctx.prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        recurringPlan: true,
        _count: { select: { invoices: true } },
      },
    });
    return clients.map((c) => ({
      ...c,
      plan: c.recurringPlan,
      invoiceCount: c._count.invoices,
      hasLogin: c.userId !== null,
    }));
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional().nullable(),
        taxId: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.client.update({
        where: { id: input.id },
        data: {
          fullName: input.fullName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          taxId: input.taxId,
          notes: input.notes,
        },
      });
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.client.update({
        where: { id: input.id },
        data: { active: input.active },
      });
    }),

  upsertPlan: adminProcedure
    .input(
      z.object({
        clientId: z.string(),
        amountUsd: z.number().positive(),
        description: z.string().min(1),
        frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
        anchorDate: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const anchor = new Date(input.anchorDate);
      if (Number.isNaN(anchor.getTime())) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Fecha inválida" });
      }

      const existing = await ctx.prisma.recurringPlan.findUnique({
        where: { clientId: input.clientId },
      });

      const plan = await ctx.prisma.recurringPlan.upsert({
        where: { clientId: input.clientId },
        update: {
          amountUsd: input.amountUsd,
          description: input.description,
          frequency: input.frequency,
          anchorDate: anchor,
          active: true,
        },
        create: {
          clientId: input.clientId,
          amountUsd: input.amountUsd,
          description: input.description,
          frequency: input.frequency,
          anchorDate: anchor,
        },
      });

      // First-time plan creation → backfill all bills from the anchor up
      // to today (inclusive). If the anchor is in the past the client
      // owes multiple periods already; each one becomes its own invoice
      // (OVERDUE for past due-dates, PENDING for today's). Skipped on
      // edits so changing amount/description doesn't spam invoices.
      if (!existing) {
        const client = await ctx.prisma.client.findUnique({
          where: { id: input.clientId },
        });
        if (client) {
          const periods = computeAllDueDatesFromAnchor(plan.frequency, plan.anchorDate);
          const todayStart = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
          ).getTime();
          await ctx.prisma.$transaction(async (tx) => {
            for (const p of periods) {
              const status = p.dueDate.getTime() < todayStart ? "OVERDUE" : "PENDING";
              const invoice = await tx.invoice.create({
                data: {
                  clientId: client.id,
                  amountUsd: plan.amountUsd,
                  description: plan.description,
                  periodStart: p.periodStart,
                  periodEnd: p.periodEnd,
                  dueDate: p.dueDate,
                  status,
                },
              });
              await tx.emailLog.create({
                data: {
                  kind: "INVOICE_CREATED",
                  toEmail: client.email,
                  subject: `Nueva factura — ${plan.description} (USD ${plan.amountUsd})`,
                  invoiceId: invoice.id,
                },
              });
            }
          });
        }
      }

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${input.clientId}`);
      return plan;
    }),

  generateInvite: adminProcedure
    .input(z.object({ clientId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.prisma.client.findUnique({
        where: { id: input.clientId },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      if (client.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este cliente ya tiene acceso al portal",
        });
      }

      // Invalidate any pending invites first.
      await ctx.prisma.invite.updateMany({
        where: { clientId: client.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = randomBytes(24).toString("base64url");
      const invite = await ctx.prisma.invite.create({
        data: {
          token,
          clientId: client.id,
          expiresAt: new Date(Date.now() + INVITE_TTL_MS),
        },
      });

      const url = `${env.APP_URL}/invite/${invite.token}`;

      // Fire-and-mostly-forget: send the invite email through Resend.
      // We don't block the response on the email — if it fails the admin
      // still has the copy-link button as a fallback. Errors are logged
      // to EmailLog inside sendEmail.
      await sendEmail({
        kind: "WELCOME",
        to: client.email,
        subject: `Te invitamos a tu portal de Surcodia`,
        template: InviteEmail({
          clientName: client.fullName,
          inviteUrl: url,
          expiresAt: invite.expiresAt,
        }),
      });

      return {
        url,
        expiresAt: invite.expiresAt,
        emailed: true,
      };
    }),

  // Link para que un cliente con acceso elija una contraseña nueva. El
  // token es nuestro (PasswordReset), dura 24 horas y sirve una vez. Se
  // devuelve siempre el link: si el mail no sale, el admin lo manda por
  // donde quiera, y el motivo viaja al lado.
  passwordReset: adminProcedure
    .input(z.object({ clientId: z.string(), send: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.prisma.client.findUnique({
        where: { id: input.clientId },
        select: { email: true, fullName: true, userId: true },
      });
      if (!client) throw new TRPCError({ code: "NOT_FOUND" });
      if (!client.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este cliente todavía no tiene acceso al portal: mandale una invitación.",
        });
      }

      const { url, expiresAt } = await createPasswordResetLink(client.userId, env.APP_URL);

      let emailed = false;
      let emailError: string | undefined;
      if (input.send) {
        const res = await sendPasswordResetEmail({ to: client.email, name: client.fullName, url });
        emailed = res.ok;
        if (!res.ok) {
          emailError =
            res.reason === "not_configured"
              ? "Resend no está configurado en este server: copiá el link y mandáselo."
              : "El mail no salió: copiá el link y mandáselo.";
        }
      }

      revalidatePath(`/dashboard/clients/${input.clientId}`);
      return { url, expiresAt, emailed, emailError };
    }),

  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const client = await ctx.prisma.client.findUnique({
      where: { id: input.id },
      include: {
        recurringPlan: true,
        invoices: {
          orderBy: { dueDate: "desc" },
          // El pago que espera revisión, si hay: es lo que habilita el
          // botón de aprobar en la fila de la factura. Sólo el id —
          // la fila no muestra nada más del pago.
          include: {
            payments: {
              where: { status: "PENDING_REVIEW" },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    });
    if (!client) throw new TRPCError({ code: "NOT_FOUND" });
    const emailLogs = await ctx.prisma.emailLog.findMany({
      where: { toEmail: client.email },
      orderBy: { sentAt: "desc" },
      take: 20,
    });
    const latestInvite = await ctx.prisma.invite.findFirst({
      where: { clientId: client.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return {
      ...client,
      plan: client.recurringPlan,
      emailLogs,
      latestInvite,
      hasLogin: client.userId !== null,
    };
  }),

  create: adminProcedure
    .input(clientInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.create({
        data: {
          fullName: input.fullName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          taxId: input.taxId,
          notes: input.notes,
        },
      });
    }),
});
