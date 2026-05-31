"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "../actions";

export function InviteForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const res = await acceptInvite(formData);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    router.push(`/login?msg=invite_accepted&email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Contraseña (mínimo 8)
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Repetí la contraseña
        </span>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {busy ? "Activando…" : "Activar mi cuenta"}
      </button>
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </form>
  );
}
