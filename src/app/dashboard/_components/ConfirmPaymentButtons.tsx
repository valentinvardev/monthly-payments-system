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
        className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
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
        className="rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
      >
        Rechazar
      </button>
    </div>
  );
}
