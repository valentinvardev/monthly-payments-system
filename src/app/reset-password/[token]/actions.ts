"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { consumePasswordReset } from "@/lib/password-reset";

export type ResetState = { error: string | null };

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const res = await consumePasswordReset(parsed.data.token, parsed.data.password);
  if (!res.ok) return { error: explain(res.reason, res.message) };

  // redirect() corta la función: va afuera de cualquier try/catch.
  redirect("/login?msg=password_updated");
}

function explain(reason: "invalid" | "used" | "expired" | "failed", message?: string) {
  switch (reason) {
    case "expired":
      return "Este link venció. Pedí uno nuevo desde «¿Olvidaste tu contraseña?».";
    case "used":
      return "Este link ya se usó. Si no fuiste vos, pedí uno nuevo.";
    case "invalid":
      return "Este link no es válido. Pedí uno nuevo desde «¿Olvidaste tu contraseña?».";
    case "failed":
      if (/same password|different from the old/i.test(message ?? "")) {
        return "Esa es la contraseña que ya tenías. Elegí una distinta.";
      }
      if (/weak|at least|characters/i.test(message ?? "")) {
        return "La contraseña es muy corta o muy fácil. Probá con una más larga.";
      }
      return `No pudimos guardar la contraseña: ${message ?? "error desconocido"}.`;
  }
}
