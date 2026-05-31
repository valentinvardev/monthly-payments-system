"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdmin } from "../actions";

export function SetupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createAdmin(formData);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    router.push("/login?msg=admin_created");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field name="fullName" label="Tu nombre" type="text" autoComplete="name" />
      <Field name="email" label="Email" type="email" autoComplete="email" required />
      <Field
        name="password"
        label="Contraseña (mínimo 8)"
        type="password"
        autoComplete="new-password"
        required
      />
      <Field
        name="confirm"
        label="Repetí la contraseña"
        type="password"
        autoComplete="new-password"
        required
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {busy ? "Creando…" : "Crear administrador"}
      </button>
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </form>
  );
}

function Field({
  name,
  label,
  type,
  autoComplete,
  required,
}: {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
      />
    </label>
  );
}
