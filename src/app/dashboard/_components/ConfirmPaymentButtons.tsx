"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";

export function ConfirmPaymentButtons({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"confirm" | "reject" | null>(null);

  const confirmM = trpc.payments.confirm.useMutation({
    onSettled: () => {
      setBusy(null);
      router.refresh();
    },
  });
  const rejectM = trpc.payments.reject.useMutation({
    onSettled: () => {
      setBusy(null);
      router.refresh();
    },
  });

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => {
          setBusy("confirm");
          confirmM.mutate({ id: paymentId });
        }}
        className="rounded-full border border-white/18 bg-white/[0.07] px-3 py-1 text-[11px] font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {busy === "confirm" ? "..." : "Confirmar"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => {
          setBusy("reject");
          rejectM.mutate({ id: paymentId });
        }}
        className="rounded-full border border-white/8 bg-transparent px-3 py-1 text-[11px] text-muted-foreground transition hover:border-rose-300/30 hover:text-rose-100/85 disabled:opacity-50"
      >
        Rechazar
      </button>
    </div>
  );
}
