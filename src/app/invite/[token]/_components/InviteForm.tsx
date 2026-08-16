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
        <span className="studio-label">
          Contraseña (mínimo 8)
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="studio-field mt-1.5"
        />
      </label>
      <label className="block">
        <span className="studio-label">
          Repetí la contraseña
        </span>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="studio-field mt-1.5"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="studio-btn studio-btn-primary font-pixel w-full px-4 py-3 text-[11px]"
      >
        {busy ? "Activando…" : "Activar mi cuenta"}
      </button>
      {error && <p className="text-sm text-rose-300/90">{error}</p>}
    </form>
  );
}
