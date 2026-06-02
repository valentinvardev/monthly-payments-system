"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { trpc } from "@/trpc/react";

export function OneOffInvoiceModal({
  open,
  onClose,
  clientId,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [description, setDescription] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setDescription("");
    setAmountUsd("");
    setDueDate(today);
    setError(null);
  }, [open, today]);

  const m = trpc.invoices.createOneOff.useMutation({
    onSuccess: () => {
      router.refresh();
      onClose();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const n = Number(amountUsd);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Ingresá un monto válido");
      return;
    }
    if (!description.trim()) {
      setError("La descripción no puede estar vacía");
      return;
    }
    m.mutate({
      clientId,
      amountUsd: n,
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-full max-w-md rounded-3xl bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-md"
    >
      <div
        style={{
          backgroundColor: "oklch(0.16 0.015 245)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 32px 80px -28px rgba(0,0,0,0.65)",
          color: "var(--color-foreground)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground/70 transition hover:bg-white/[0.08] hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <header className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
            Factura única
          </p>
          <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-foreground">
            Cobro de una sola vez
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground/85">
            No depende del plan recurrente. Usá esto para servicios extra, ajustes o un cobro
            puntual.
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
              Descripción <span className="text-rose-200/70">*</span>
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ej. Hora extra de soporte"
              className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                Monto USD <span className="text-rose-200/70">*</span>
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                required
                className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                Vence el <span className="text-rose-200/70">*</span>
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {error && <p className="text-sm text-rose-200/85">{error}</p>}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={m.isPending}
                className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
              >
                {m.isPending ? "Creando…" : "Crear factura"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}
