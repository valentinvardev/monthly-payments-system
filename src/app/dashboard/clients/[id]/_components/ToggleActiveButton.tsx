"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const m = trpc.clients.setActive.useMutation({
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
      className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-foreground/85 transition hover:bg-white/[0.08] hover:border-white/22 hover:text-foreground disabled:opacity-50"
    >
      {busy ? "…" : active ? "Pausar" : "Reactivar"}
    </button>
  );
}
