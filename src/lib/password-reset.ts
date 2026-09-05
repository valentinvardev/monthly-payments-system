import "server-only";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import {
  createPasswordResetLink,
  hashResetToken,
  type ResetTokenStatus,
} from "@/lib/password-reset-token";

// Recuperación de contraseña con tokens propios.
//
// Antes el formulario llamaba a resetPasswordForEmail desde el navegador:
// el mail salía por el SMTP por defecto de Supabase (plantilla genérica,
// pocos por hora, nada en EmailLog) y el link volvía a la Site URL del
// proyecto, que es localhost. Ninguna de las dos cosas se veía desde el
// panel; sólo se veía que "no llegaba".
//
// Ahora el token vive en nuestra base (PasswordReset), el mail sale por
// Resend con la plantilla propia, y la contraseña la cambia el server con
// la clave de servicio. El link es una URL nuestra y funciona desde
// cualquier dispositivo.

// Dos pedidos seguidos al mismo mail dentro de esta ventana mandan uno
// solo. Corta el doble click y a quien quiera llenarle la casilla a otro.
export const RESET_COOLDOWN_MS = 2 * 60 * 1000;

export { createPasswordResetLink };

export async function sendPasswordResetEmail(args: {
  to: string;
  name?: string | null;
  url: string;
}) {
  return sendEmail({
    kind: "PASSWORD_RESET",
    to: args.to,
    subject: "Elegí una contraseña nueva para Surcodia",
    template: PasswordResetEmail({ resetUrl: args.url, name: args.name ?? undefined }),
  });
}

// Formulario público. Contesta lo mismo exista el mail o no: la única
// forma de saber si una dirección está registrada es tener acceso a esa
// casilla.
export async function requestPasswordReset(rawEmail: string): Promise<{ ok: boolean }> {
  const email = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true },
  });
  if (!user) return { ok: true };

  const recent = await prisma.emailLog.findFirst({
    where: {
      kind: "PASSWORD_RESET",
      toEmail: email,
      error: null,
      sentAt: { gt: new Date(Date.now() - RESET_COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recent) return { ok: true };

  const { url } = await createPasswordResetLink(user.id, env.APP_URL);
  const res = await sendPasswordResetEmail({ to: email, name: user.fullName, url });
  return { ok: res.ok };
}

export type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: Exclude<ResetTokenStatus, "valid"> | "failed"; message?: string };

// Cambia la contraseña del dueño del token y lo quema.
export async function consumePasswordReset(
  token: string,
  password: string,
): Promise<ConsumeResult> {
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { user: { select: { authUserId: true } } },
  });
  if (!reset) return { ok: false, reason: "invalid" };
  if (reset.usedAt) return { ok: false, reason: "used" };
  if (reset.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  // Se marca usado antes de tocar la contraseña, con la condición en el
  // WHERE: dos envíos simultáneos del mismo formulario no pueden pasar
  // los dos, gana el primero y el otro ve "ya se usó".
  const claimed = await prisma.passwordReset.updateMany({
    where: { id: reset.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) return { ok: false, reason: "used" };

  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(reset.user.authUserId, {
    password,
  });
  if (error) {
    // Supabase rechazó la contraseña (muy corta, igual a la anterior):
    // se devuelve el token para que pueda probar con otra.
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: null } });
    return { ok: false, reason: "failed", message: error.message };
  }

  return { ok: true };
}
