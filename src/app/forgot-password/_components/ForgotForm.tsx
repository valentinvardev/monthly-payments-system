"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-emerald-300/25 bg-emerald-300/[0.07] p-5 text-sm leading-relaxed text-emerald-200">
        Si el email está registrado, te llega un link en unos segundos. Revisá tu bandeja de
        entrada y el correo no deseado.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="studio-label">
          Email
        </span>
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          placeholder="vos@dominio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="studio-field mt-1.5"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="studio-btn studio-btn-primary font-pixel w-full px-4 py-3 text-[11px]"
      >
        {busy ? "Enviando…" : "Mandarme el link"}
      </button>
      {error && <p className="text-sm text-rose-300/90">{error}</p>}
    </form>
  );
}
