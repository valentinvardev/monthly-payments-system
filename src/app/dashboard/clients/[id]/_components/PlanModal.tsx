"use client";

import { useEffect, useRef, useState } from "react";
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
  anchorDate: string;
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
  const ref = useRef<HTMLDialogElement>(null);
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "MONTHLY");
  const [anchorDate, setAnchorDate] = useState<string>(
    initial?.anchorDate ?? new Date().toISOString().slice(0, 10),
  );
  const [amountUsd, setAmountUsd] = useState<string>(
    initial?.amountUsd ? String(initial.amountUsd) : "",
  );
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  // Sync native <dialog> open state with React state.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      setFrequency(initial?.frequency ?? "MONTHLY");
      setAnchorDate(initial?.anchorDate ?? new Date().toISOString().slice(0, 10));
      setAmountUsd(initial?.amountUsd ? String(initial.amountUsd) : "");
      setDescription(initial?.description ?? "");
      setError(null);
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
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

  const anchorLabel: Record<Frequency, string> = {
    DAILY: "Empieza el",
    WEEKLY: "Día de la semana",
    MONTHLY: "Día de vencimiento",
    YEARLY: "Vence cada año el",
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (i.e. directly on the dialog element)
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-full max-w-md rounded-3xl border border-white/12 bg-[oklch(0.16_0.015_245)] p-0 text-foreground shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-md"
    >
      <div className="relative p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-foreground/70 transition hover:bg-white/[0.10] hover:text-foreground"
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
                        ? "border-white/30 bg-white/[0.10]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]",
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
                className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={m.isPending}
                className="rounded-full border border-white/22 bg-white/[0.10] px-5 py-2 text-sm font-medium text-foreground transition hover:bg-white/[0.15] hover:border-white/32 disabled:opacity-50"
              >
                {m.isPending ? "Guardando…" : initial ? "Guardar cambios" : "Crear plan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
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
        className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground transition focus:border-white/30 focus:bg-white/[0.07] focus:outline-none placeholder:text-muted-foreground/55"
      />
    </label>
  );
}
