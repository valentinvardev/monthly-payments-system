"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function GenerateInvoiceButton({
  clientId,
  hasPlan,
}: {
  clientId: string;
  hasPlan: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gen = trpc.invoices.generateNextMonth.useMutation({
    onSuccess: () => router.refresh(),
    onError: (e) => setError(e.message),
    onSettled: () => setBusy(false),
  });

  if (!hasPlan) {
    return (
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
        Sin plan
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          gen.mutate({ clientId });
        }}
        className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-white/[0.08] hover:border-white/22 hover:text-foreground disabled:opacity-50"
      >
        {busy ? "Generando..." : "+ Próxima factura"}
      </button>
      {error && <span className="text-[11px] text-rose-200/85">{error}</span>}
    </div>
  );
}
