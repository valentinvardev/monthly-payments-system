"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { trpc } from "@/trpc/react";

export function DeleteMethodButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const m = trpc.paymentMethods.delete.useMutation({
    onSettled: () => {
      setBusy(false);
      router.refresh();
    },
  });

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        if (!confirm("¿Eliminar este método de pago? Esta acción es permanente.")) return;
        setBusy(true);
        m.mutate({ id });
      }}
      title="Eliminar"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-transparent text-muted-foreground transition hover:border-rose-300/30 hover:text-rose-100/90 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
