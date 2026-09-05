"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetState } from "../actions";

const initial: ResetState = { error: null };

// El token viaja en un campo oculto y lo valida el server: acá no hay
// sesión de Supabase ni nada que esperar. Si sale bien, la acción
// redirige a /login con el aviso.
export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="studio-label">Nueva contraseña</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoFocus
          autoComplete="new-password"
          className="studio-field mt-1.5"
        />
      </label>
      <label className="block">
        <span className="studio-label">Repetí la contraseña</span>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          className="studio-field mt-1.5"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-primary font-pixel w-full px-4 py-3 text-[11px]"
      >
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
      {state.error && <p className="text-sm text-rose-300/90">{state.error}</p>}
    </form>
  );
}
