"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";
import { OneOffInvoiceModal } from "./OneOffInvoiceModal";

export function InvoiceActions({
  clientId,
  hasPlan,
}: {
  clientId: string;
  hasPlan: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const gen = trpc.invoices.generateNext.useMutation({
    onSuccess: () => router.refresh(),
    onError: (e) => setError(e.message),
    onSettled: () => setBusy(false),
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-white/[0.08] hover:border-white/22 hover:text-foreground"
        >
          + Factura única
        </button>
        {hasPlan ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError(null);
              gen.mutate({ clientId });
            }}
            className="rounded-full border border-white/18 bg-white/[0.07] px-3 py-1.5 text-[11px] font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
          >
            {busy ? "Generando…" : "+ Próxima del plan"}
          </button>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            Sin plan recurrente
          </span>
        )}
      </div>
      {error && <span className="text-[10px] text-rose-200/85">{error}</span>}

      <OneOffInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clientId={clientId}
      />
    </div>
  );
}
