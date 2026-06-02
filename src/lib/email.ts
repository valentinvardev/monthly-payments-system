import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import type { EmailKind } from "@/generated/prisma/client";

let cachedClient: Resend | null = null;

function client(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!cachedClient) cachedClient = new Resend(env.RESEND_API_KEY);
  return cachedClient;
}

export const isEmailConfigured = () => Boolean(env.RESEND_API_KEY);

type SendArgs = {
  kind: EmailKind;
  to: string;
  subject: string;
  template: React.ReactElement;
  invoiceId?: string;
};

// Send a transactional email through Resend AND log the attempt to
// EmailLog (success or failure). If Resend isn't configured, we still
// log the attempt so the admin sees what *would* have been sent.
export async function sendEmail({
  kind,
  to,
  subject,
  template,
  invoiceId,
}: SendArgs) {
  const html = await render(template);
  const r = client();

  if (!r) {
    await prisma.emailLog.create({
      data: {
        kind,
        toEmail: to,
        subject,
        invoiceId: invoiceId ?? null,
        error: "Resend not configured (RESEND_API_KEY missing)",
      },
    });
    return { ok: false as const, reason: "not_configured" };
  }

  try {
    const res = await r.emails.send({
      from: env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    if (res.error) {
      await prisma.emailLog.create({
        data: {
          kind,
          toEmail: to,
          subject,
          invoiceId: invoiceId ?? null,
          error: String(res.error.message ?? res.error),
        },
      });
      return { ok: false as const, reason: "resend_error", error: res.error };
    }
    await prisma.emailLog.create({
      data: {
        kind,
        toEmail: to,
        subject,
        invoiceId: invoiceId ?? null,
        providerId: res.data?.id ?? null,
      },
    });
    return { ok: true as const, id: res.data?.id };
  } catch (err) {
    await prisma.emailLog.create({
      data: {
        kind,
        toEmail: to,
        subject,
        invoiceId: invoiceId ?? null,
        error: (err as Error).message,
      },
    });
    return { ok: false as const, reason: "exception", error: err };
  }
}
