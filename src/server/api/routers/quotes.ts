import { z } from "zod";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { QuoteSentEmail } from "@/emails/QuoteSentEmail";
import { QuoteDecidedEmail } from "@/emails/QuoteDecidedEmail";
import { InvoiceCreatedEmail } from "@/emails/InvoiceCreatedEmail";

const appUrl = () => env.APP_URL.replace(/\/+$/, "");
const total = (items: { amountUsd: unknown }[]) =>
  items.reduce((acc, i) => acc + Number(i.amountUsd), 0);

export const quotesRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        leadId: z.string().optional(),
        name: z.string().min(2).max(120),
        email: z.string().email().max(200),
        company: z.string().max(120).optional(),
        title: z.string().min(2).max(200),
        intro: z.string().max(2000).optional(),
        locale: z.enum(["es", "en"]).default("es"),
        validUntil: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string().min(1).max(200),
              detail: z.string().max(500).optional(),
              amountUsd: z.number().nonnegative(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.create({
        data: {
          clientId: input.clientId || null,
          leadId: input.leadId || null,
          name: input.name.trim(),
          email: input.email.trim(),
          company: input.company?.trim() || null,
          title: input.title.trim(),
          intro: input.intro?.trim() || null,
          locale: input.locale,
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
          items: {
            create: input.items.map((it, i) => ({
              label: it.label.trim(),
              detail: it.detail?.trim() || null,
              amountUsd: it.amountUsd,
              sortOrder: i,
            })),
          },
        },
      });
      revalidatePath("/dashboard/quotes");
      return quote;
    }),

  list: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }),

  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const quote = await ctx.prisma.quote.findUnique({
      where: { id: input.id },
      include: { items: { orderBy: { sortOrder: "asc" } }, client: true, lead: true },
    });
    if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
    return quote;
  }),

  // Envía (o reenvía) el presupuesto al destinatario.
  send: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const quote = await ctx.prisma.quote.findUnique({
      where: { id: input.id },
      include: { items: true },
    });
    if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
    if (quote.status === "ACCEPTED" || quote.status === "REJECTED") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "El presupuesto ya fue decidido" });
    }

    const updated = await ctx.prisma.quote.update({
      where: { id: quote.id },
      data: { status: "SENT", sentAt: new Date() },
    });

    await sendEmail({
      kind: "QUOTE_SENT",
      to: quote.email,
      subject:
        quote.locale === "en"
          ? `Your proposal — ${quote.title}`
          : `Tu presupuesto — ${quote.title}`,
      template: QuoteSentEmail({
        name: quote.name,
        title: quote.title,
        totalUsd: total(quote.items),
        quoteUrl: `${appUrl()}/presupuesto/${quote.token}`,
        validUntil: quote.validUntil,
        locale: quote.locale as "es" | "en",
      }),
    });

    revalidatePath("/dashboard/quotes");
    revalidatePath(`/dashboard/quotes/${quote.id}`);
    return updated;
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.quote.delete({ where: { id: input.id } });
    revalidatePath("/dashboard/quotes");
    return { ok: true };
  }),

  // Registrar una decisión que llegó por fuera (respondió el mail, WhatsApp…).
  markDecided: adminProcedure
    .input(z.object({ id: z.string(), status: z.enum(["ACCEPTED", "REJECTED"]) }))
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.update({
        where: { id: input.id },
        data: { status: input.status, decidedAt: new Date() },
      });
      revalidatePath("/dashboard/quotes");
      revalidatePath(`/dashboard/quotes/${quote.id}`);
      return quote;
    }),

  // Presupuesto aceptado de un Client existente → factura única PENDING
  // (vence en 7 días) con el mail de siempre.
  convertToInvoice: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.findUnique({
        where: { id: input.id },
        include: { items: true, client: true },
      });
      if (!quote) throw new TRPCError({ code: "NOT_FOUND" });
      if (!quote.client) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El presupuesto no está vinculado a un cliente. Creá el cliente primero y armale la factura desde su ficha.",
        });
      }
      if (quote.status !== "ACCEPTED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Solo se convierten presupuestos aceptados" });
      }

      const today = new Date();
      const due = new Date(today);
      due.setDate(due.getDate() + 7);

      const invoice = await ctx.prisma.invoice.create({
        data: {
          clientId: quote.client.id,
          amountUsd: total(quote.items),
          description: quote.title,
          periodStart: today,
          periodEnd: today,
          dueDate: due,
          status: "PENDING",
        },
      });

      await sendEmail({
        kind: "INVOICE_CREATED",
        to: quote.client.email,
        subject: `Nueva factura — ${quote.title}`,
        template: InvoiceCreatedEmail({
          clientName: quote.client.fullName,
          description: quote.title,
          amountUsd: total(quote.items),
          dueDate: due,
          portalUrl: `${appUrl()}/portal/invoice/${invoice.id}`,
        }),
        invoiceId: invoice.id,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${quote.client.id}`);
      return invoice;
    }),

  // ---------- público (página /presupuesto/[token]) ----------

  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.findUnique({
        where: { token: input.token },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });
      // Los borradores no existen para el mundo exterior.
      if (!quote || quote.status === "DRAFT") throw new TRPCError({ code: "NOT_FOUND" });
      return quote;
    }),

  decide: publicProcedure
    .input(
      z.object({
        token: z.string(),
        decision: z.enum(["ACCEPTED", "REJECTED"]),
        reason: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.findUnique({
        where: { token: input.token },
        include: { items: true },
      });
      if (!quote || quote.status === "DRAFT") throw new TRPCError({ code: "NOT_FOUND" });
      if (quote.status !== "SENT") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este presupuesto ya fue decidido" });
      }
      if (quote.validUntil && quote.validUntil.getTime() < Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este presupuesto venció" });
      }

      const updated = await ctx.prisma.quote.update({
        where: { id: quote.id },
        data: {
          status: input.decision,
          decidedAt: new Date(),
          rejectReason: input.decision === "REJECTED" ? input.reason?.trim() || null : null,
        },
      });

      // El aviso al admin sale después de responder — el que aceptó no
      // tiene por qué esperar el round-trip a Resend.
      after(() =>
        sendEmail({
          kind: "QUOTE_DECIDED",
          to: env.ADMIN_EMAIL,
          subject:
            input.decision === "ACCEPTED"
              ? `✅ ${quote.name} aceptó — ${quote.title}`
              : `❌ ${quote.name} rechazó — ${quote.title}`,
          template: QuoteDecidedEmail({
            name: quote.name,
            title: quote.title,
            totalUsd: total(quote.items),
            accepted: input.decision === "ACCEPTED",
            reason: input.reason,
            adminUrl: `${appUrl()}/dashboard/quotes/${quote.id}`,
          }),
        }),
      );

      revalidatePath("/dashboard/quotes");
      return { status: updated.status };
    }),
});
