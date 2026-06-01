"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function NewClientForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [withPlan, setWithPlan] = useState(false);

  const create = trpc.clients.create.useMutation({
    onSuccess: (client) => {
      router.push(`/dashboard/clients/${client.id}`);
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string | null)?.trim() || undefined;

    const plan = withPlan
      ? {
          amountUsd: Number(fd.get("amountUsd")),
          description: String(fd.get("planDescription") ?? "").trim(),
          dueDayOfMonth: Number(fd.get("dueDayOfMonth")),
        }
      : undefined;

    create.mutate({
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: get("phone"),
      taxId: get("taxId"),
      notes: get("notes"),
      plan,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Section title="Datos del cliente">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="fullName" label="Nombre / Razón social" required />
          <Field name="email" label="Email" type="email" required />
          <Field name="phone" label="Teléfono" />
          <Field name="taxId" label="CUIT / Tax ID" />
        </div>
        <Field name="notes" label="Notas" textarea />
      </Section>

      <Section title="Plan recurrente (opcional)">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85">
          <input
            type="checkbox"
            checked={withPlan}
            onChange={(e) => setWithPlan(e.target.checked)}
            className="accent-foreground/70"
          />
          Agregar plan recurrente ahora
        </label>
        {withPlan && (
          <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field
                name="amountUsd"
                label="Monto USD"
                type="number"
                step="0.01"
                min="0"
                required
              />
              <Field
                name="dueDayOfMonth"
                label="Día de vencimiento"
                type="number"
                min="1"
                max="28"
                required
              />
              <Field
                name="planDescription"
                label="Descripción"
                required
                className="sm:col-span-1"
              />
            </div>
          </div>
        )}
      </Section>

      <div className="flex items-center justify-between gap-4">
        {error && <p className="text-sm text-rose-200/85">{error}</p>}
        <div className="ml-auto">
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
          >
            {create.isPending ? "Guardando…" : "Crear cliente"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
  className,
  step,
  min,
  max,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  className?: string;
  step?: string;
  min?: string;
  max?: string;
}) {
  const baseInput =
    "glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55";
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-rose-200/70">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} className={baseInput} rows={2} required={required} />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          step={step}
          min={min}
          max={max}
          className={baseInput}
        />
      )}
    </label>
  );
}
