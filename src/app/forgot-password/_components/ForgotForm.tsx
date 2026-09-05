"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotState } from "../actions";

const initial: ForgotState = { status: "idle" };

// El pedido va al server: el link lo genera Supabase con la clave de
// servicio y el mail sale por Resend con nuestra plantilla. Antes esto
// llamaba a resetPasswordForEmail desde el navegador y el mail dependía
// del SMTP por defecto de Supabase.
export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);

  if (state.status === "sent") {
    return (
      <div className="border border-emerald-300/25 bg-emerald-300/[0.07] p-5 text-sm leading-relaxed text-emerald-200">
        Si el email está registrado, te llega un link en unos segundos. Revisá la bandeja de
        entrada y el correo no deseado. El link sirve una sola vez y vence en 24 horas.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="studio-label">Email</span>
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="vos@dominio.com"
          className="studio-field mt-1.5"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-primary font-pixel w-full px-4 py-3 text-[11px]"
      >
        {pending ? "Enviando…" : "Mandarme el link"}
      </button>
      {state.status === "error" && <p className="text-sm text-rose-300/90">{state.message}</p>}
    </form>
  );
}
