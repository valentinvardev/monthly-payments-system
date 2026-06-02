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
});
