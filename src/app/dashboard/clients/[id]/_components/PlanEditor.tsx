"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

type Plan = {
  amountUsd: number;
  description: string;
  dueDayOfMonth: number;
};

export function PlanEditor({
  clientId,
  plan,
}: {
  clientId: string;
  plan: Plan | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const m = trpc.clients.upsertPlan.useMutation({
    onSuccess: () => {
      setSavedAt(new Date());
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSavedAt(null);
    const fd = new FormData(e.currentTarget);
    m.mutate({
      clientId,
      amountUsd: Number(fd.get("amountUsd")),
      description: String(fd.get("description") ?? "").trim(),
      dueDayOfMonth: Number(fd.get("dueDayOfMonth")),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!plan && (
        <p className="text-sm text-muted-foreground">
          Este cliente no tiene un plan recurrente. Cargá uno para poder generar facturas mensuales
          automáticamente.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Monto USD <span className="text-rose-200/70">*</span>
          </span>
          <input
            name="amountUsd"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={plan?.amountUsd ?? ""}
            className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Día vto. <span className="text-rose-200/70">*</span>
          </span>
          <input
            name="dueDayOfMonth"
            type="number"
            min="1"
            max="28"
            required
            defaultValue={plan?.dueDayOfMonth ?? ""}
            className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Descripción <span className="text-rose-200/70">*</span>
          </span>
          <input
            name="description"
            type="text"
            required
            defaultValue={plan?.description ?? ""}
            className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] text-muted-foreground">
          {error && <span className="text-rose-200/85">{error}</span>}
          {!error && savedAt && (
            <span className="text-emerald-200/90">
              Guardado · {savedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={m.isPending}
          className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
        >
          {m.isPending ? "Guardando…" : plan ? "Actualizar plan" : "Crear plan"}
        </button>
      </div>
    </form>
  );
}
