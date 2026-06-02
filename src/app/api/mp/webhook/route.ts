import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment } from "@/lib/mercadoPago";
import { sendEmail } from "@/lib/email";
import { PaymentReceivedEmail } from "@/emails/PaymentReceivedEmail";
import { revalidatePath } from "next/cache";

// Mercado Pago webhook. MP sends notifications when payment state changes.
// Notifications can arrive as POST or GET, payload structure varies between
// the legacy ("IPN") format and the new ("v1/notifications") format. We
// normalise to: `topic/type` and `dataId`.
//
// Once we have a payment id we re-fetch the payment from MP (authoritative
// source) and update the matching Invoice / Payment rows. The fetch
// doubles as authentication — only requests for real payment ids that our
// connected account can see succeed.

type MpHook = {
  type?: string;
  topic?: string;
  data?: { id?: string | number };
};

async function readBody(req: NextRequest): Promise<MpHook | null> {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text) as MpHook;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  return process(req);
}
export async function GET(req: NextRequest) {
  return process(req);
}

async function process(req: NextRequest) {
  const url = new URL(req.url);
  const body = await readBody(req);

  const topic =
    body?.type ?? body?.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId =
    body?.data?.id?.toString() ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id");

  if (topic !== "payment" || !dataId) {
    // MP also sends merchant_order, plan, etc. — ignore those for now.
    return NextResponse.json({ ok: true, ignored: true, topic });
  }

  let payment;
  try {
    payment = await getPayment(dataId);
  } catch (err) {
    console.error("[mp/webhook] getPayment failed", err);
    return NextResponse.json({ ok: false, error: "getPayment_failed" }, { status: 500 });
  }

  const invoiceId = payment.external_reference ?? null;
  if (!invoiceId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "no_external_reference" });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true },
  });
  if (!invoice) {
    return NextResponse.json({ ok: true, ignored: true, reason: "invoice_not_found" });
  }

  // Idempotency: if we already saw this MP payment id, skip mutating.
  const already = await prisma.payment.findFirst({
    where: { externalId: String(payment.id) },
  });
  if (already && already.status === "CONFIRMED") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  if (payment.status === "approved") {
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoiceId,
          method: "MERCADOPAGO",
          status: "CONFIRMED",
          amountUsd: invoice.amountUsd,
          arsAmount: payment.transaction_amount ?? null,
          externalId: String(payment.id),
          externalRaw: payment as unknown as object,
          confirmedAt: payment.date_approved
            ? new Date(payment.date_approved)
            : new Date(),
        },
      });
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    });

    // Best-effort notifications. Failures are logged to EmailLog inside
    // sendEmail; we don't want to retry the webhook just because Resend
    // hiccupped.
    await sendEmail({
      kind: "PAYMENT_RECEIVED",
      to: invoice.client.email,
      subject: `Pago recibido — ${invoice.description}`,
      template: PaymentReceivedEmail({
        clientName: invoice.client.fullName,
        description: invoice.description,
        amountUsd: Number(invoice.amountUsd),
        externalId: String(payment.id),
      }),
      invoiceId: invoice.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/clients/${invoice.clientId}`);
    revalidatePath(`/portal/invoice/${invoice.id}`);
    revalidatePath("/portal");

    return NextResponse.json({ ok: true, marked: "PAID" });
  }

  if (payment.status === "rejected" || payment.status === "cancelled") {
    await prisma.payment.create({
      data: {
        invoiceId,
        method: "MERCADOPAGO",
        status: "REJECTED",
        amountUsd: invoice.amountUsd,
        arsAmount: payment.transaction_amount ?? null,
        externalId: String(payment.id),
        externalRaw: payment as unknown as object,
      },
    });
    return NextResponse.json({ ok: true, marked: "REJECTED" });
  }

  // pending / in_process / etc. — log it but don't touch the invoice.
  return NextResponse.json({ ok: true, status: payment.status });
}
