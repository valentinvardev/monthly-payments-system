"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
        <p className="font-medium text-foreground/95">Revisá tu casilla</p>
        <p className="mt-1 text-muted-foreground">
          Te enviamos un link mágico a{" "}
          <span className="font-mono text-foreground/85">{email}</span>. Hacé clic para entrar.
        </p>
        <p className="mt-3 text-[11px] text-muted-foreground/70">
          ¿No te llegó? Mirá en spam o reintentá en unos minutos.
        </p>
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
          placeholder="vos@dominio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando…" : "Enviar link mágico"}
      </button>
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </form>
  );
}
