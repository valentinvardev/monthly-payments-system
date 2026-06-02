import { InviteEmail } from "@/emails/InviteEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { InvoiceCreatedEmail } from "@/emails/InvoiceCreatedEmail";
import { ReminderBeforeDueEmail } from "@/emails/ReminderBeforeDueEmail";
import { OverdueEmail } from "@/emails/OverdueEmail";
import { PaymentSubmittedEmail } from "@/emails/PaymentSubmittedEmail";
import { PaymentReviewRequiredEmail } from "@/emails/PaymentReviewRequiredEmail";
import { PaymentReceivedEmail } from "@/emails/PaymentReceivedEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import type { EmailKind } from "@/generated/prisma/client";

export type EmailTestKey =
  | "INVITE"
  | "WELCOME"
  | "INVOICE_CREATED"
  | "REMINDER_BEFORE_DUE"
  | "OVERDUE"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_REVIEW_REQUIRED"
  | "PAYMENT_RECEIVED"
  | "PASSWORD_RESET";

export type EmailCatalogEntry = {
  key: EmailTestKey;
  label: string;
  description: string;
  audience: "Cliente" | "Administrador";
  trigger: string;
  logKind: EmailKind;
  // Build args from a single APP_URL base to avoid passing each prop.
  build: (appUrl: string) => {
    subject: string;
    template: React.ReactElement;
  };
};

function inDays(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export const EMAIL_CATALOG: EmailCatalogEntry[] = [
  {
    key: "INVITE",
    label: "Invitación",
    description: "Mail con link de activación que se manda cuando el admin invita a un cliente.",
    audience: "Cliente",
    trigger: "Admin toca el paperplane en /dashboard/clients",
    logKind: "WELCOME",
    build: (appUrl) => ({
      subject: "[TEST] Te invitamos a tu portal de Surcodia",
      template: InviteEmail({
        clientName: "Cliente de Prueba",
        inviteUrl: `${appUrl}/invite/PREVIEW_TOKEN`,
        expiresAt: inDays(7),
      }),
    }),
  },
  {
    key: "WELCOME",
    label: "Bienvenida",
    description: "Mail de bienvenida con highlights del portal (post-activación).",
    audience: "Cliente",
    trigger: "Después de aceptar el invite y activar la cuenta",
    logKind: "WELCOME",
    build: (appUrl) => ({
      subject: "[TEST] Bienvenido a Surcodia",
      template: WelcomeEmail({
        clientName: "Cliente de Prueba",
        portalUrl: `${appUrl}/portal`,
      }),
    }),
  },
  {
    key: "INVOICE_CREATED",
    label: "Nueva factura",
    description: "Se manda cuando se emite una factura (manual, recurrente o por cron).",
    audience: "Cliente",
    trigger: "clients.upsertPlan / invoices.generateNext / invoices.createOneOff / cron",
    logKind: "INVOICE_CREATED",
    build: (appUrl) => ({
      subject: "[TEST] Nueva factura — Mantenimiento mensual",
      template: InvoiceCreatedEmail({
        clientName: "Cliente de Prueba",
        description: "Mantenimiento mensual",
        amountUsd: 200,
        dueDate: inDays(7),
        portalUrl: `${appUrl}/portal/invoice/PREVIEW_ID`,
      }),
    }),
  },
  {
    key: "REMINDER_BEFORE_DUE",
    label: "Recordatorio antes del vencimiento",
    description: "Recordatorio 3, 1 y 0 días antes del vencimiento.",
    audience: "Cliente",
    trigger: "Cron diario (/api/cron/billing)",
    logKind: "REMINDER_BEFORE_DUE",
    build: (appUrl) => ({
      subject: "[TEST] Recordatorio: Mantenimiento mensual vence en 3 días",
      template: ReminderBeforeDueEmail({
        clientName: "Cliente de Prueba",
        description: "Mantenimiento mensual",
        amountUsd: 200,
        dueDate: inDays(3),
        daysUntil: 3,
        portalUrl: `${appUrl}/portal/invoice/PREVIEW_ID`,
      }),
    }),
  },
  {
    key: "OVERDUE",
    label: "Factura vencida",
    description: "Una sola vez cuando una factura pasa a OVERDUE.",
    audience: "Cliente",
    trigger: "Cron diario (/api/cron/billing) al marcar OVERDUE",
    logKind: "OVERDUE",
    build: (appUrl) => ({
      subject: "[TEST] Factura vencida — Mantenimiento mensual",
      template: OverdueEmail({
        clientName: "Cliente de Prueba",
        description: "Mantenimiento mensual",
        amountUsd: 200,
        dueDate: daysAgo(5),
        daysOverdue: 5,
        portalUrl: `${appUrl}/portal/invoice/PREVIEW_ID`,
      }),
    }),
  },
  {
    key: "PAYMENT_SUBMITTED",
    label: "Pago en revisión (al cliente)",
    description: "Confirma al cliente que recibimos su comprobante de transferencia/crypto.",
    audience: "Cliente",
    trigger: "Cliente envía submitManualPayment con el comprobante",
    logKind: "PAYMENT_REVIEW_REQUIRED",
    build: (appUrl) => ({
      subject: "[TEST] Recibimos tu pago — Mantenimiento mensual",
      template: PaymentSubmittedEmail({
        clientName: "Cliente de Prueba",
        description: "Mantenimiento mensual",
        amountUsd: 200,
        method: "BANK_TRANSFER",
        portalUrl: `${appUrl}/portal/invoice/PREVIEW_ID`,
      }),
    }),
  },
  {
    key: "PAYMENT_REVIEW_REQUIRED",
    label: "Pago en revisión (al admin)",
    description: "Le avisa al admin que tiene un comprobante para confirmar o rechazar.",
    audience: "Administrador",
    trigger: "Cliente envía submitManualPayment con el comprobante",
    logKind: "PAYMENT_REVIEW_REQUIRED",
    build: (appUrl) => ({
      subject: "[TEST] Comprobante recibido — Mantenimiento mensual",
      template: PaymentReviewRequiredEmail({
        clientName: "Cliente de Prueba",
        description: "Mantenimiento mensual",
        amountUsd: 200,
        method: "BANK_TRANSFER",
        notes: "Transferencia desde Banco Galicia, hoy a las 10:30",
        proofUrl: `${appUrl}/PREVIEW_PROOF.png`,
        adminUrl: `${appUrl}/dashboard`,
      }),
    }),
  },
  {
    key: "PAYMENT_RECEIVED",
    label: "Pago confirmado",
    description: "Confirmación al cliente de que su pago se acreditó.",
    audience: "Cliente",
    trigger: "Webhook MP approved / admin confirma manual payment",
    logKind: "PAYMENT_RECEIVED",
    build: (_appUrl) => ({
      subject: "[TEST] Pago recibido — Mantenimiento mensual",
      template: PaymentReceivedEmail({
        clientName: "Cliente de Prueba",
        description: "Mantenimiento mensual",
        amountUsd: 200,
        externalId: "MP-99887766",
      }),
    }),
  },
  {
    key: "PASSWORD_RESET",
    label: "Reset de contraseña",
    description:
      "Template para configurar en Supabase → Auth → Email Templates. Supabase reemplaza {{ .ConfirmationURL }} en producción.",
    audience: "Cliente",
    trigger: "Cliente toca '¿olvidaste tu contraseña?' en /login",
    logKind: "MAGIC_LINK_INFO",
    build: (appUrl) => ({
      subject: "[TEST] Reestablecé tu contraseña",
      template: PasswordResetEmail({
        resetUrl: `${appUrl}/reset-password#PREVIEW_TOKEN`,
        email: "cliente@ejemplo.com",
      }),
    }),
  },
];

export function getEntry(key: string): EmailCatalogEntry | undefined {
  return EMAIL_CATALOG.find((e) => e.key === key);
}
