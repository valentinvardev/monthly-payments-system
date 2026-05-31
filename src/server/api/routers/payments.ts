import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, clientProcedure, createTRPCRouter } from "@/server/api/trpc";
import { getUsdToArsRate } from "@/lib/exchange-rate";

export const paymentsRouter = createTRPCRouter({
  pendingReview: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.payment.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      include: { invoice: { include: { client: true } } },
    });
    return rows.map((p) => ({
      ...p,
      invoice: p.invoice,
      client: p.invoice.client,
    }));
  }),

  // Demo: simulate a MercadoPago payment that succeeds immediately.
  simulateMercadoPago: clientProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (invoice.clientId !== ctx.clientId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const rate = await getUsdToArsRate().catch(() => null);
      const amountUsd = Number(invoice.amountUsd);

      return ctx.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            method: "MERCADOPAGO",
            status: "CONFIRMED",
            amountUsd,
            arsAmount: rate ? Math.round(amountUsd * rate.rate * 100) / 100 : null,
            arsRate: rate?.rate ?? null,
            externalId: `MP-DEMO-${Math.floor(Math.random() * 100000)}`,
            confirmedAt: new Date(),
          },
        });
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID", paidAt: new Date() },
        });
        const client = await tx.client.findUnique({ where: { id: invoice.clientId } });
        if (client) {
          await tx.emailLog.create({
            data: {
              kind: "PAYMENT_RECEIVED",
              toEmail: client.email,
              subject: `Pago recibido — ${invoice.description}`,
              invoiceId: invoice.id,
            },
          });
        }
        return payment;
      });
    }),

  submitManualPayment: clientProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        method: z.enum(["BANK_TRANSFER", "CRYPTO"]),
        paymentMethodConfigId: z.string(),
        notes: z.string().optional(),
        proofFileName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (invoice.clientId !== ctx.clientId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const safeName = (input.proofFileName ?? `${input.paymentMethodConfigId}-${Date.now()}.png`)
        .replace(/[^a-zA-Z0-9._-]+/g, "_");

      return ctx.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            method: input.method,
            status: "PENDING_REVIEW",
            amountUsd: invoice.amountUsd,
            proofUrl: `https://demo.invalid/proofs/${safeName}`,
            notes: input.notes,
          },
        });
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "PENDING_REVIEW" },
        });
        await tx.emailLog.create({
          data: {
            kind: "PAYMENT_REVIEW_REQUIRED",
            toEmail: process.env.ADMIN_EMAIL ?? "admin@surcodia.test",
            subject: `Comprobante recibido — ${invoice.description}`,
            invoiceId: invoice.id,
          },
        });
        return payment;
      });
    }),

  confirm: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({ where: { id: input.id } });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.$transaction(async (tx) => {
        const updated = await tx.payment.update({
          where: { id: payment.id },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PAID", paidAt: new Date() },
        });
        return updated;
      });
    }),

  reject: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({ where: { id: input.id } });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.$transaction(async (tx) => {
        const updated = await tx.payment.update({
          where: { id: payment.id },
          data: { status: "REJECTED" },
        });
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PENDING" },
        });
        return updated;
      });
    }),
});
