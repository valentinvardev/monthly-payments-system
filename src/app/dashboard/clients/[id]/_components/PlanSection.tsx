"use client";

import { useState } from "react";
import { PlanModal } from "./PlanModal";

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

const freqLabel: Record<Frequency, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
};

export function PlanSection({
  clientId,
  plan,
}: {
  clientId: string;
  plan:
    | {
        amountUsd: number;
        description: string;
        frequency: Frequency;
        anchorDate: string; // YYYY-MM-DD
        anchorPretty: string;
      }
    | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {plan ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
              {freqLabel[plan.frequency]} · USD {plan.amountUsd}
            </p>
            <p className="text-sm text-foreground/95">{plan.description}</p>
            <p className="text-xs text-muted-foreground">{plan.anchorPretty}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-[#1f1f1f] hover:border-white/25 hover:text-foreground"
          >
            Editar plan
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Este cliente no tiene un plan recurrente. Cargá uno para poder generar facturas
            automáticamente.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-none border border-white/12 bg-[#161616] px-4 py-2 text-sm font-medium text-foreground/95 transition hover:bg-[#1f1f1f] hover:border-white/25"
          >
            + Crear plan
          </button>
        </div>
      )}

      <PlanModal
        open={open}
        onClose={() => setOpen(false)}
        clientId={clientId}
        initial={
          plan
            ? {
                amountUsd: plan.amountUsd,
                description: plan.description,
                frequency: plan.frequency,
                anchorDate: plan.anchorDate,
              }
            : null
        }
      />
    </>
  );
}
