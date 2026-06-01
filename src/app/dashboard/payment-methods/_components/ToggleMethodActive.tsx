"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function ToggleMethodActive({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const m = trpc.paymentMethods.setActive.useMutation({
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
        setBusy(true);
        m.mutate({ id, active: !active });
      }}
      className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/80 transition hover:bg-white/[0.08] hover:border-white/22 hover:text-foreground disabled:opacity-50"
    >
      {busy ? "…" : active ? "Pausar" : "Activar"}
    </button>
  );
}
