"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { trpc } from "@/trpc/react";

export function DeleteInvoiceButton({ id }: { id: string }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const del = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      router.refresh();
      setArmed(false);
    },
    onError: (e) => {
      setError(e.message);
      setArmed(false);
    },
  });

  if (del.isPending) {
    return (
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
        borrando…
      </span>
    );
  }

  if (armed) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setError(null);
            del.mutate({ id });
          }}
          className="rounded-none border border-rose-300/40 bg-rose-300/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-300/[0.18] hover:border-rose-300/55"
        >
          Confirmar borrar
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          title="Cancelar"
          className="inline-flex h-6 w-6 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-foreground/70 transition hover:bg-[#1f1f1f] hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setArmed(true);
        }}
        title="Borrar factura"
        className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-muted-foreground transition hover:border-rose-300/30 hover:bg-rose-300/[0.06] hover:text-rose-100/85"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {error && <span className="text-[10px] text-rose-200/85">{error}</span>}
    </div>
  );
}
