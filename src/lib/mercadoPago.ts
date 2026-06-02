import "server-only";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const MP_API = "https://api.mercadopago.com";
const REFRESH_LEEWAY_MS = 60 * 1000; // refresh when within 1 minute of expiry

type MpTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

// Refresh the connection's access token if it's about to expire.
// We support a single admin connection at a time — fetch the most
// recently-updated one. Returns the live access token.
export async function getValidAccessToken(): Promise<string> {
  const conn = await prisma.mercadoPagoConnection.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!conn) {
    throw new Error("Mercado Pago no está conectado todavía.");
  }

  const expiresAt = conn.expiresAt?.getTime() ?? 0;
  const aboutToExpire = expiresAt && expiresAt < Date.now() + REFRESH_LEEWAY_MS;
  if (!aboutToExpire) return conn.accessToken;

  if (!conn.refreshToken) {
    throw new Error(
      "El token de Mercado Pago venció y no hay refresh token guardado. Reconectá tu cuenta.",
    );
  }
  if (!env.MERCADOPAGO_CLIENT_ID || !env.MERCADOPAGO_CLIENT_SECRET) {
    throw new Error("Faltan MERCADOPAGO_CLIENT_ID / SECRET en el server.");
  }

  const res = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MERCADOPAGO_CLIENT_ID,
      client_secret: env.MERCADOPAGO_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: conn.refreshToken,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MP refresh fallo (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as MpTokenResponse;

  await prisma.mercadoPagoConnection.update({
    where: { id: conn.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? conn.refreshToken,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : null,
    },
  });

  return data.access_token;
}

export type MpPreferenceResult = {
  initPoint: string;
  sandboxInitPoint?: string;
  preferenceId: string;
  amountArs: number;
  rateArs: number;
};

// Creates a Mercado Pago Checkout Pro preference for a single invoice.
// USD amount is converted to ARS using the provided rate; both numbers
// are returned so callers can persist a snapshot.
export async function createMpPreference(args: {
  invoiceId: string;
  description: string;
  amountUsd: number;
  rateArs: number;
  payerEmail: string;
}): Promise<MpPreferenceResult> {
  const token = await getValidAccessToken();
  const amountArs = Math.round(args.amountUsd * args.rateArs * 100) / 100;
  const base = env.APP_URL.replace(/\/+$/, "");

  const body = {
    items: [
      {
        title: args.description.slice(0, 256),
        quantity: 1,
        unit_price: amountArs,
        currency_id: "ARS",
      },
    ],
    external_reference: args.invoiceId,
    back_urls: {
      success: `${base}/portal/invoice/${args.invoiceId}?mp_status=success`,
      pending: `${base}/portal/invoice/${args.invoiceId}?mp_status=pending`,
      failure: `${base}/portal/invoice/${args.invoiceId}?mp_status=failure`,
    },
    auto_return: "approved",
    notification_url: `${base}/api/mp/webhook`,
    payer: { email: args.payerEmail },
    metadata: {
      invoice_id: args.invoiceId,
      amount_usd: args.amountUsd,
      rate_usd_ars: args.rateArs,
    },
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MP preference fallo (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return {
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
    preferenceId: data.id,
    amountArs,
    rateArs: args.rateArs,
  };
}

export type MpPayment = {
  id: number;
  status: string; // approved, rejected, in_process, pending, refunded, ...
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  currency_id?: string;
  payer?: { email?: string };
  payment_method_id?: string;
  payment_type_id?: string;
  date_approved?: string | null;
  date_created?: string | null;
  metadata?: Record<string, unknown>;
};

export async function getPayment(id: string | number): Promise<MpPayment> {
  const token = await getValidAccessToken();
  const res = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MP getPayment fallo (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as MpPayment;
}
