import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

// La parte del reset que sólo toca la base: crear, mirar y marcar tokens.
// Va separada de lib/password-reset.ts (que manda mails y cambia la
// contraseña en Supabase) para que un script de operaciones pueda
// generar un link sin arrastrar módulos marcados server-only.

// 24 horas: el admin manda el link por WhatsApp y el cliente lo abre
// cuando puede. Es de un solo uso, así que la ventana larga no lo hace
// reutilizable.
export const PASSWORD_RESET_TTL_MS = 24 * 60 * 60 * 1000;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function passwordResetUrl(appUrl: string, token: string) {
  return `${appUrl.replace(/\/+$/, "")}/reset-password/${token}`;
}

// Un token nuevo por usuario. Los pendientes anteriores se anulan: el
// último link mandado es el que vale, igual que con las invitaciones.
export async function createPasswordResetLink(userId: string, appUrl: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.$transaction([
    prisma.passwordReset.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordReset.create({
      data: { tokenHash: hashResetToken(token), userId, expiresAt },
    }),
  ]);

  return { url: passwordResetUrl(appUrl, token), expiresAt };
}

export type ResetTokenStatus = "valid" | "invalid" | "used" | "expired";

export async function peekPasswordReset(token: string): Promise<ResetTokenStatus> {
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashResetToken(token) },
    select: { usedAt: true, expiresAt: true },
  });
  if (!reset) return "invalid";
  if (reset.usedAt) return "used";
  if (reset.expiresAt.getTime() < Date.now()) return "expired";
  return "valid";
}
