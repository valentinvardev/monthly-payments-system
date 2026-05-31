import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  clientProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const invoicesRouter = createTRPCRouter({
  listAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.invoice.findMany({
      orderBy: { dueDate: "desc" },
      include: { client: true },
    });
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

  generateNextMonth: adminProcedure
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

      const today = new Date();
      const periodStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const periodEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, plan.dueDayOfMonth);

      return ctx.prisma.$transaction(async (tx) => {
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
        return invoice;
      });
    }),

  markPaid: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.invoice.update({
        where: { id: input.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }),
});
