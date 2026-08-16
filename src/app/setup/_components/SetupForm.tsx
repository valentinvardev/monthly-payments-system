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
        className="studio-btn studio-btn-primary font-pixel w-full px-4 py-3 text-[11px]"
      >
        {busy ? "Creando…" : "Crear administrador"}
      </button>
      {error && <p className="text-sm text-rose-300/90">{error}</p>}
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
      <span className="studio-label">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="studio-field mt-1.5"
      />
    </label>
  );
}
