import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/lib/env";
import { computeNextPeriod } from "@/lib/recurrence";

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

      // First-time plan creation → generate the first invoice immediately.
      // If you're creating a plan it's because the client owes you, so the
      // schedule should start producing bills right away. Skipped on edits
      // so updating amount/description doesn't spam invoices.
      if (!existing) {
        const client = await ctx.prisma.client.findUnique({
          where: { id: input.clientId },
        });
        if (client) {
          const { periodStart, periodEnd, dueDate } = computeNextPeriod(
            plan.frequency,
            plan.anchorDate,
          );
          await ctx.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
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
            await tx.emailLog.create({
              data: {
                kind: "INVOICE_CREATED",
                toEmail: client.email,
                subject: `Nueva factura — ${plan.description} (USD ${plan.amountUsd})`,
                invoiceId: invoice.id,
              },
            });
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

      return {
        url: `${env.APP_URL}/invite/${invite.token}`,
        expiresAt: invite.expiresAt,
      };
    }),

  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const client = await ctx.prisma.client.findUnique({
      where: { id: input.id },
      include: {
        recurringPlan: true,
        invoices: { orderBy: { dueDate: "desc" } },
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
