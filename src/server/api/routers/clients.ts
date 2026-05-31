import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { store, nextId } from "@/lib/demo/store";

const clientInput = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

const planInput = z.object({
  amountUsd: z.number().positive(),
  description: z.string().min(1),
  dueDayOfMonth: z.number().int().min(1).max(28),
});

export const clientsRouter = createTRPCRouter({
  list: adminProcedure.query(() => {
    const s = store();
    return s.clients.map((c) => ({
      ...c,
      plan: s.plans.find((p) => p.clientId === c.id) ?? null,
      invoiceCount: s.invoices.filter((i) => i.clientId === c.id).length,
    }));
  }),

  get: adminProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const s = store();
    const client = s.clients.find((c) => c.id === input.id);
    if (!client) throw new Error("Cliente no encontrado");
    return {
      ...client,
      plan: s.plans.find((p) => p.clientId === client.id) ?? null,
      invoices: s.invoices.filter((i) => i.clientId === client.id),
    };
  }),

  create: adminProcedure
    .input(clientInput.extend({ plan: planInput.optional() }))
    .mutation(({ input }) => {
      const s = store();
      const id = nextId("c");
      const now = new Date();
      const client = {
        id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        taxId: input.taxId,
        notes: input.notes,
        active: true,
        createdAt: now,
      };
      s.clients.push(client);
      if (input.plan) {
        s.plans.push({
          id: nextId("p"),
          clientId: id,
          amountUsd: input.plan.amountUsd,
          description: input.plan.description,
          dueDayOfMonth: input.plan.dueDayOfMonth,
          active: true,
          startDate: now,
        });
      }
      return client;
    }),
});
