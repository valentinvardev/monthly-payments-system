import { z } from "zod";
import {
  adminProcedure,
  clientProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { nextId, store } from "@/lib/demo/store";
import type { Invoice } from "@/lib/demo/types";

export const invoicesRouter = createTRPCRouter({
  listAll: adminProcedure.query(() => {
    const s = store();
    return s.invoices
      .map((i) => ({ ...i, client: s.clients.find((c) => c.id === i.clientId) }))
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  }),

  listMine: clientProcedure.query(({ ctx }) => {
    const s = store();
    return s.invoices
      .filter((i) => i.clientId === ctx.clientId)
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  }),

  get: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    const s = store();
    const invoice = s.invoices.find((i) => i.id === input.id);
    if (!invoice) throw new Error("Factura no encontrada");
    if (ctx.user.role === "CLIENT" && invoice.clientId !== ctx.user.clientId) {
      throw new Error("FORBIDDEN");
    }
    return {
      ...invoice,
      client: s.clients.find((c) => c.id === invoice.clientId),
      payments: s.payments.filter((p) => p.invoiceId === invoice.id),
    };
  }),

  generateNextMonth: adminProcedure
    .input(z.object({ clientId: z.string() }))
    .mutation(({ input }) => {
      const s = store();
      const client = s.clients.find((c) => c.id === input.clientId);
      const plan = s.plans.find((p) => p.clientId === input.clientId);
      if (!client) throw new Error("Cliente no encontrado");
      if (!plan) throw new Error("El cliente no tiene un plan recurrente cargado");

      const today = new Date();
      const periodStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const periodEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, plan.dueDayOfMonth);

      const invoice: Invoice = {
        id: nextId("i"),
        clientId: client.id,
        amountUsd: plan.amountUsd,
        description: plan.description,
        periodStart,
        periodEnd,
        dueDate,
        status: "PENDING",
        createdAt: new Date(),
      };
      s.invoices.push(invoice);

      s.emailLogs.push({
        id: nextId("el"),
        kind: "INVOICE_CREATED",
        toEmail: client.email,
        subject: `Nueva factura — ${plan.description} (USD ${plan.amountUsd})`,
        invoiceId: invoice.id,
        sentAt: new Date(),
      });

      return invoice;
    }),

  markPaid: adminProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const s = store();
    const invoice = s.invoices.find((i) => i.id === input.id);
    if (!invoice) throw new Error("Factura no encontrada");
    invoice.status = "PAID";
    invoice.paidAt = new Date();
    return invoice;
  }),
});
