import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

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
    }));
  }),

  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const client = await ctx.prisma.client.findUnique({
      where: { id: input.id },
      include: {
        recurringPlan: true,
        invoices: { orderBy: { dueDate: "desc" } },
      },
    });
    if (!client) throw new Error("Cliente no encontrado");
    return { ...client, plan: client.recurringPlan };
  }),

  create: adminProcedure
    .input(clientInput.extend({ plan: planInput.optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const client = await tx.client.create({
          data: {
            fullName: input.fullName,
            email: input.email.toLowerCase(),
            phone: input.phone,
            taxId: input.taxId,
            notes: input.notes,
          },
        });
        if (input.plan) {
          await tx.recurringPlan.create({
            data: {
              clientId: client.id,
              amountUsd: input.plan.amountUsd,
              description: input.plan.description,
              dueDayOfMonth: input.plan.dueDayOfMonth,
            },
          });
        }
        return client;
      });
    }),
});
