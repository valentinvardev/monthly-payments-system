"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { trpc } from "@/trpc/react";
import type { InvoiceStatus } from "@/lib/types";

// Acciones de aprobación en la fila de cada factura.
//
// Hay dos caminos distintos y se elige por el estado, para no ofrecer
// nunca una acción que no aplica:
//
// · El cliente subió un comprobante (hay un pago en revisión) →
//   Aprobar / Rechazar sobre ESE pago. Aprobar deja el pago en
//   CONFIRMED y la factura en PAID dentro de una transacción, así que
//   el registro de pago queda consistente. Es la misma acción que la
//   cola del inicio del panel.
//
// · No hay comprobante y la factura sigue debiendo (pendiente o
//   vencida) → Marcar pagada, para lo que cobraste por fuera del
//   sistema. No deja registro de pago, y no tiene vuelta atrás desde
//   la interfaz, así que pide confirmación en dos pasos.
//
// Pagada o cancelada no muestran nada: sólo queda borrar.

const OWED: InvoiceStatus[] = ["PENDING", "OVERDUE", "PENDING_REVIEW"];

export function InvoiceRowActions({
  invoiceId,
  status,
  pendingPaymentId,
}: {
  invoiceId: string;
  status: InvoiceStatus;
  pendingPaymentId: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | "paid" | null>(null);
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = () => {
    setBusy(null);
    setArmed(false);
    router.refresh();
  };
  const fail = (e: { message: string }) => {
    setBusy(null);
    setArmed(false);
    setError(e.message);
  };

  const confirmM = trpc.payments.confirm.useMutation({ onSuccess: done, onError: fail });
  const rejectM = trpc.payments.reject.useMutation({ onSuccess: done, onError: fail });
  const markPaidM = trpc.invoices.markPaid.useMutation({ onSuccess: done, onError: fail });

  const busyLabel =
    busy === "approve"
      ? "aprobando…"
      : busy === "reject"
        ? "rechazando…"
        : busy === "paid"
          ? "guardando…"
          : null;

  if (busyLabel) {
    return (
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
        {busyLabel}
      </span>
    );
  }

  // Camino 1: hay un comprobante esperando revisión.
  if (pendingPaymentId) {
    return (
      <Wrap error={error}>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setBusy("approve");
            confirmM.mutate({ id: pendingPaymentId });
          }}
          className="rounded-none border border-white/12 bg-[#161616] px-3 py-1 text-[11px] font-medium text-foreground/95 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
        >
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setBusy("reject");
            rejectM.mutate({ id: pendingPaymentId });
          }}
          className="rounded-none border border-white/8 bg-transparent px-3 py-1 text-[11px] text-muted-foreground transition hover:border-rose-300/30 hover:text-rose-100/85"
        >
          Rechazar
        </button>
      </Wrap>
    );
  }

  // Camino 2: se debe plata y no hay comprobante que revisar.
  if (!OWED.includes(status)) return null;

  if (armed) {
    return (
      <Wrap error={error}>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setBusy("paid");
            markPaidM.mutate({ id: invoiceId });
          }}
          className="rounded-none border border-emerald-300/40 bg-emerald-300/[0.10] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-300/55 hover:bg-emerald-300/[0.18]"
        >
          Confirmar pagada
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          title="Cancelar"
          className="inline-flex h-6 w-6 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-foreground/70 transition hover:bg-[#1f1f1f] hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </Wrap>
    );
  }

  return (
    <Wrap error={error}>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setArmed(true);
        }}
        className="rounded-none border border-white/12 bg-[#161616] px-3 py-1 text-[11px] font-medium text-foreground/85 transition hover:border-emerald-300/35 hover:bg-emerald-300/[0.08] hover:text-emerald-100"
      >
        Marcar pagada
      </button>
    </Wrap>
  );
}

function Wrap({
  children,
  error,
}: {
  children: React.ReactNode;
  error: string | null;
}) {
  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <div className="inline-flex items-center gap-1.5">{children}</div>
      {error && <span className="text-[10px] text-rose-200/85">{error}</span>}
    </div>
  );
}
