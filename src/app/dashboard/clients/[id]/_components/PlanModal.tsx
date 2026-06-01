"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { trpc } from "@/trpc/react";

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

const FREQUENCIES: { value: Frequency; label: string; hint: string }[] = [
  { value: "DAILY", label: "Diario", hint: "Una factura por día" },
  { value: "WEEKLY", label: "Semanal", hint: "Una factura por semana" },
  { value: "MONTHLY", label: "Mensual", hint: "Una factura por mes" },
  { value: "YEARLY", label: "Anual", hint: "Una factura por año" },
];

type Plan = {
  amountUsd: number;
  description: string;
  frequency: Frequency;
  anchorDate: string; // YYYY-MM-DD
};

export function PlanModal({
  open,
  onClose,
  clientId,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  initial: Plan | null;
}) {
  const router = useRouter();
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "MONTHLY");
  const [anchorDate, setAnchorDate] = useState<string>(
    initial?.anchorDate ?? new Date().toISOString().slice(0, 10),
  );
  const [amountUsd, setAmountUsd] = useState<string>(
    initial?.amountUsd ? String(initial.amountUsd) : "",
  );
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while open and listen for Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Reset state when modal reopens with a new initial.
  useEffect(() => {
    if (!open) return;
    setFrequency(initial?.frequency ?? "MONTHLY");
    setAnchorDate(initial?.anchorDate ?? new Date().toISOString().slice(0, 10));
    setAmountUsd(initial?.amountUsd ? String(initial.amountUsd) : "");
    setDescription(initial?.description ?? "");
    setError(null);
  }, [open, initial]);

  const m = trpc.clients.upsertPlan.useMutation({
    onSuccess: () => {
      router.refresh();
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const n = Number(amountUsd);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Ingresá un monto válido");
      return;
    }
    if (!description.trim()) {
      setError("La descripción no puede estar vacía");
      return;
    }
    m.mutate({
      clientId,
      amountUsd: n,
      description: description.trim(),
      frequency,
      anchorDate: new Date(anchorDate).toISOString(),
    });
  }

  if (!open || typeof document === "undefined") return null;

  const anchorLabel: Record<Frequency, string> = {
    DAILY: "Empieza el",
    WEEKLY: "Día de la semana",
    MONTHLY: "Día de vencimiento",
    YEARLY: "Vence cada año el",
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <div className="glass-strong relative w-full max-w-md rounded-3xl p-6 reveal">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground/70 transition hover:bg-white/[0.08] hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <header className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
            Plan recurrente
          </p>
          <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-foreground">
            {initial ? "Editar plan" : "Crear plan"}
          </h2>
        </header>

        <form onSubmit={onSubmit} className="space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
              Frecuencia
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => {
                const active = frequency === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrequency(f.value)}
                    className={[
                      "rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-white/22 bg-white/[0.08]"
                        : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <p className="text-sm font-medium text-foreground/95">{f.label}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      {f.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field
            label={anchorLabel[frequency]}
            name="anchorDate"
            type="date"
            value={anchorDate}
            onChange={setAnchorDate}
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Monto USD"
              name="amountUsd"
              type="number"
              step="0.01"
              min="0"
              value={amountUsd}
              onChange={setAmountUsd}
              required
            />
            <Field
              label="Descripción"
              name="description"
              value={description}
              onChange={setDescription}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {error && <p className="text-sm text-rose-200/85">{error}</p>}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={m.isPending}
                className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
              >
                {m.isPending ? "Guardando…" : initial ? "Guardar cambios" : "Crear plan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-rose-200/70">*</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step={step}
        min={min}
        className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
      />
    </label>
  );
}
