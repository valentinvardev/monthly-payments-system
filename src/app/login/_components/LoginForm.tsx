"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // After login, send users to /ingreso where the role-based redirect
  // routes ADMINs to /dashboard and CLIENTs to /portal. (`/` is the
  // public studio landing now.) `next` only wins when explicitly set.
  const next = params.get("next") ?? "/ingreso";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      setError(traduce(error.message));
      return;
    }
    router.push(next);
    router.refresh();
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
      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Contraseña
        </span>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {busy ? "Entrando…" : "Entrar"}
      </button>
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </form>
  );
}

function traduce(msg: string) {
  if (/invalid login/i.test(msg)) return "Email o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg)) return "Confirmá tu email antes de entrar.";
  return msg;
}
