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
      <div className="rounded-2xl border border-emerald-200/25 bg-emerald-200/[0.06] p-5 text-sm text-emerald-100/95">
        Si el email está registrado, te vamos a mandar un link en unos segundos. Revisá tu inbox y
        spam.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
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
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {busy ? "Enviando…" : "Mandarme el link"}
      </button>
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </form>
  );
}
