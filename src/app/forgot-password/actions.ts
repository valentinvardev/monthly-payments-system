"use server";

import { z } from "zod";
import { requestPasswordReset } from "@/lib/password-reset";

export type ForgotState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string };

const GENERIC_ERROR = "No pudimos mandar el mail. Probá de nuevo en un rato.";

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = z
    .string()
    .trim()
    .email()
    .safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) return { status: "error", message: "Escribí un email válido." };

  try {
    const res = await requestPasswordReset(parsed.data);
    return res.ok ? { status: "sent" } : { status: "error", message: GENERIC_ERROR };
  } catch (e) {
    // El detalle va al log del server; al usuario no le sirve y podría
    // filtrar si el mail existe.
    console.error("[forgot-password]", e);
    return { status: "error", message: GENERIC_ERROR };
  }
}
