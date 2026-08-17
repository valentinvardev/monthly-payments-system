import { z } from "zod";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { adminProcedure, clientProcedure, createTRPCRouter } from "@/server/api/trpc";
import { getUsdToArsRate } from "@/lib/exchange-rate";
import { createMpPreference } from "@/lib/mercadoPago";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { PaymentReviewRequiredEmail } from "@/emails/PaymentReviewRequiredEmail";
import { PaymentSubmittedEmail } from "@/emails/PaymentSubmittedEmail";
import { getProofUploadToken, getProofSignedDownloadUrl } from "@/lib/supabase/storage";

export const paymentsRouter = createTRPCRouter({
  pendingReview: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.payment.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      include: { invoice: { include: { client: true } } },
    });
    // Resolve a short-lived signed URL for each proof so the admin can
    // open it directly. Legacy demo http:// proofs pass through as-is.
    const withSignedUrls = await Promise.all(
      rows.map(async (p) => {
        const proofSignedUrl = await getProofSignedDownloadUrl(p.proofUrl, 3600);
        return {
          ...p,
          invoice: p.invoice,
          client: p.invoice.client,
          proofSignedUrl,
        };
      }),
    );
    return withSignedUrls;
  }),

  // Returns a one-shot signed upload URL for the proofs bucket. The
  // client uploads directly to Supabase via `uploadToSignedUrl`, then
  // submits the returned path through submitManualPayment.
  getProofUploadToken: clientProcedure
    .input(z.object({ invoiceId: z.string(), filename: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (invoice.clientId !== ctx.clientId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      try {
        return await getProofUploadToken({
          invoiceId: input.invoiceId,
          filename: input.filename,
        });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (err as Error).message,
        });
      }
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
        // Storage path inside the proofs bucket — the client uploaded the
        // file directly via getProofUploadToken and now hands back the path
        // they got back. Optional: clients can still mark a payment
        // without attaching anything.
        proofStoragePath: z.string().optional(),
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

      const client = await ctx.prisma.client.findUnique({
        where: { id: invoice.clientId },
      });

      const result = await ctx.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            method: input.method,
            status: "PENDING_REVIEW",
            amountUsd: invoice.amountUsd,
            proofUrl: input.proofStoragePath ?? null,
            notes: input.notes,
          },
        });
        return payment;
      });

      // Generate a 24h signed URL for the admin email so they can open
      // the proof straight from the inbox without logging in first.
      const proofSignedUrl = await getProofSignedDownloadUrl(result.proofUrl, 86400);
      const base = env.APP_URL.replace(/\/+$/, "");

      // Notify admin so they can review.
      await sendEmail({
        kind: "PAYMENT_REVIEW_REQUIRED",
        to: env.ADMIN_EMAIL,
        subject: `Comprobante recibido — ${invoice.description}`,
        template: PaymentReviewRequiredEmail({
          clientName: client?.fullName ?? "Cliente",
          description: invoice.description,
          amountUsd: Number(invoice.amountUsd),
          method: input.method,
          notes: input.notes,
          proofUrl: proofSignedUrl,
          adminUrl: `${base}/dashboard`,
        }),
        invoiceId: invoice.id,
      });

      // Confirm to the client that we received the proof.
      if (client) {
        await sendEmail({
          kind: "PAYMENT_REVIEW_REQUIRED",
          to: client.email,
          subject: `Recibimos tu pago — ${invoice.description}`,
          template: PaymentSubmittedEmail({
            clientName: client.fullName,
            description: invoice.description,
            amountUsd: Number(invoice.amountUsd),
            method: input.method,
            portalUrl: `${base}/portal/invoice/${invoice.id}`,
          }),
          invoiceId: invoice.id,
        });
      }

      return result;
    }),

  confirm: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({ where: { id: input.id } });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND" });

      const { updated, clientId } = await ctx.prisma.$transaction(async (tx) => {
        const updated = await tx.payment.update({
          where: { id: payment.id },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
        const invoice = await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PAID", paidAt: new Date() },
        });
        return { updated, clientId: invoice.clientId };
      });

      // Ahora esto también se dispara desde la ficha del cliente, así
      // que hay que invalidar las tres vistas que muestran el estado.
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${clientId}`);
      return updated;
    }),

  reject: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({ where: { id: input.id } });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND" });

      const { updated, clientId } = await ctx.prisma.$transaction(async (tx) => {
        const updated = await tx.payment.update({
          where: { id: payment.id },
          data: { status: "REJECTED" },
        });
        const invoice = await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PENDING" },
        });
        return { updated, clientId: invoice.clientId };
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/invoices");
      revalidatePath(`/dashboard/clients/${clientId}`);
      return updated;
    }),
});
