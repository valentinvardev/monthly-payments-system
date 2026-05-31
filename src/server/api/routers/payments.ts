import { z } from "zod";
import { adminProcedure, clientProcedure, createTRPCRouter } from "@/server/api/trpc";
import { nextId, store } from "@/lib/demo/store";
import { getUsdToArsRate } from "@/lib/exchange-rate";

export const paymentsRouter = createTRPCRouter({
  pendingReview: adminProcedure.query(() => {
    const s = store();
    return s.payments
      .filter((p) => p.status === "PENDING_REVIEW")
      .map((p) => ({
        ...p,
        invoice: s.invoices.find((i) => i.id === p.invoiceId),
        client: (() => {
          const inv = s.invoices.find((i) => i.id === p.invoiceId);
          return inv ? s.clients.find((c) => c.id === inv.clientId) : undefined;
        })(),
      }));
  }),

  // Demo: simulate a MercadoPago payment that succeeds immediately.
  simulateMercadoPago: clientProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const s = store();
      const invoice = s.invoices.find((i) => i.id === input.invoiceId);
      if (!invoice) throw new Error("Factura no encontrada");
      if (invoice.clientId !== ctx.clientId) throw new Error("FORBIDDEN");

      const rate = await getUsdToArsRate().catch(() => null);
      const payment = {
        id: nextId("pay"),
        invoiceId: invoice.id,
        method: "MERCADOPAGO" as const,
        status: "CONFIRMED" as const,
        amountUsd: invoice.amountUsd,
        arsAmount: rate ? Math.round(invoice.amountUsd * rate.rate * 100) / 100 : undefined,
        arsRate: rate?.rate,
        externalId: `MP-DEMO-${Math.floor(Math.random() * 100000)}`,
        confirmedAt: new Date(),
        createdAt: new Date(),
      };
      s.payments.push(payment);

      invoice.status = "PAID";
      invoice.paidAt = new Date();

      s.emailLogs.push({
        id: nextId("el"),
        kind: "PAYMENT_RECEIVED",
        toEmail: s.clients.find((c) => c.id === invoice.clientId)?.email ?? "",
        subject: `Pago recibido — ${invoice.description}`,
        invoiceId: invoice.id,
        sentAt: new Date(),
      });

      return payment;
    }),

  // Demo: client uploads "proof" (we just record a fake URL) — admin must confirm.
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
    .mutation(({ ctx, input }) => {
      const s = store();
      const invoice = s.invoices.find((i) => i.id === input.invoiceId);
      if (!invoice) throw new Error("Factura no encontrada");
      if (invoice.clientId !== ctx.clientId) throw new Error("FORBIDDEN");

      const safeName = (input.proofFileName ?? `${input.paymentMethodConfigId}-${Date.now()}.png`)
        .replace(/[^a-zA-Z0-9._-]+/g, "_");

      const payment = {
        id: nextId("pay"),
        invoiceId: invoice.id,
        method: input.method,
        status: "PENDING_REVIEW" as const,
        amountUsd: invoice.amountUsd,
        proofUrl: `https://demo.invalid/proofs/${safeName}`,
        notes: input.notes,
        createdAt: new Date(),
      };
      s.payments.push(payment);
      invoice.status = "PENDING_REVIEW";

      s.emailLogs.push({
        id: nextId("el"),
        kind: "PAYMENT_REVIEW_REQUIRED",
        toEmail: "admin@demo.test",
        subject: `Comprobante recibido — ${invoice.description}`,
        invoiceId: invoice.id,
        sentAt: new Date(),
      });

      return payment;
    }),

  confirm: adminProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const s = store();
    const payment = s.payments.find((p) => p.id === input.id);
    if (!payment) throw new Error("Pago no encontrado");
    payment.status = "CONFIRMED";
    payment.confirmedAt = new Date();
    const invoice = s.invoices.find((i) => i.id === payment.invoiceId);
    if (invoice) {
      invoice.status = "PAID";
      invoice.paidAt = new Date();
    }
    return payment;
  }),

  reject: adminProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const s = store();
    const payment = s.payments.find((p) => p.id === input.id);
    if (!payment) throw new Error("Pago no encontrado");
    payment.status = "REJECTED";
    const invoice = s.invoices.find((i) => i.id === payment.invoiceId);
    if (invoice) invoice.status = "PENDING";
    return payment;
  }),
});
