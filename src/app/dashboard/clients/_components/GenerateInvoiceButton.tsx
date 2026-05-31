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
    onSuccess: () => {
      router.refresh();
    },
    onError: (e) => setError(e.message),
    onSettled: () => setBusy(false),
  });

  if (!hasPlan) {
    return <span className="text-xs text-muted-foreground">Sin plan</span>;
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
        className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
      >
        {busy ? "..." : "Generar factura del próximo mes"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
