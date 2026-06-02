import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, clientProcedure, createTRPCRouter } from "@/server/api/trpc";
import { getUsdToArsRate } from "@/lib/exchange-rate";
import { createMpPreference } from "@/lib/mercadoPago";

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

  // Create a real Mercado Pago Checkout Pro preference for the given
  // invoice using the admin's connected MP account. Returns the
  // checkout URL the client should be redirected to. Records an
  // INITIATED Payment row so we know a checkout was opened.
  createMpPreference: clientProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
        include: { client: true },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (invoice.clientId !== ctx.clientId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (invoice.status === "PAID") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta factura ya está pagada",
        });
      }

      const rate = await getUsdToArsRate();
      const amountUsd = Number(invoice.amountUsd);

      let preference;
      try {
        preference = await createMpPreference({
          invoiceId: invoice.id,
          description: invoice.description,
          amountUsd,
          rateArs: rate.rate,
          payerEmail: invoice.client.email,
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (err as Error).message,
        });
      }

      // Track the checkout attempt so the admin sees it in the pending
      // pipeline. The webhook will flip this row's status once MP
      // confirms (or creates a fresh row keyed by mp payment id).
      await ctx.prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          method: "MERCADOPAGO",
          status: "INITIATED",
          amountUsd,
          arsAmount: preference.amountArs,
          arsRate: preference.rateArs,
          externalId: preference.preferenceId,
        },
      });

      return { url: preference.initPoint, preferenceId: preference.preferenceId };
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
