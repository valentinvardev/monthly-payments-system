"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Supabase puts the recovery session into the URL hash on landing. The
  // browser client picks it up automatically — we just wait for the
  // auth state to settle so we can confirm we have a session.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setReady(Boolean(session));
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/login?msg=password_updated");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Nueva contraseña
        </span>
        <input
          type="password"
          required
          autoFocus
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Repetí la contraseña
        </span>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <button
        type="submit"
        disabled={busy || !ready}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {busy ? "Guardando…" : ready ? "Guardar contraseña" : "Validando link..."}
      </button>
      {!ready && (
        <p className="text-[11px] text-muted-foreground/70">
          Si el link expiró o no tiene sesión activa, pedí uno nuevo desde la página de
          contraseña olvidada.
        </p>
      )}
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </form>
  );
}
