"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Send, Trash2 } from "lucide-react";
import { trpc } from "@/trpc/react";

export function QuoteActions({
  id,
  status,
  publicUrl,
  hasClient,
}: {
  id: string;
  status: string;
  publicUrl: string;
  hasClient: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onDone = () => router.refresh();
  const send = trpc.quotes.send.useMutation({ onSuccess: onDone, onError: (e) => setError(e.message) });
  const mark = trpc.quotes.markDecided.useMutation({ onSuccess: onDone, onError: (e) => setError(e.message) });
  const convert = trpc.quotes.convertToInvoice.useMutation({
    onSuccess: () => router.push("/dashboard/invoices"),
    onError: (e) => setError(e.message),
  });
  const del = trpc.quotes.delete.useMutation({
    onSuccess: () => router.push("/dashboard/quotes"),
    onError: (e) => setError(e.message),
  });

  const busy = send.isPending || mark.isPending || convert.isPending || del.isPending;
  const btn =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50";

  return (
    <div className="reveal space-y-3" style={{ animationDelay: "120ms" }}>
      <div className="flex flex-wrap items-center gap-2.5">
        {(status === "DRAFT" || status === "SENT") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => send.mutate({ id })}
            className={`${btn} border-white/22 bg-white/[0.09] text-foreground hover:bg-white/[0.14]`}
          >
            <Send className="h-3.5 w-3.5" />
            {send.isPending ? "Enviando…" : status === "DRAFT" ? "Enviar al destinatario" : "Reenviar email"}
          </button>
        )}

        {status === "SENT" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => mark.mutate({ id, status: "ACCEPTED" })}
              className={`${btn} border-emerald-300/30 bg-emerald-300/[0.08] text-emerald-100 hover:bg-emerald-300/[0.16]`}
            >
              <Check className="h-3.5 w-3.5" /> Marcar aceptado
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => mark.mutate({ id, status: "REJECTED" })}
              className={`${btn} border-rose-300/30 bg-rose-300/[0.06] text-rose-100 hover:bg-rose-300/[0.14]`}
            >
              Marcar rechazado
            </button>
          </>
        )}

        {status === "ACCEPTED" && hasClient && (
          <button
            type="button"
            disabled={busy}
            onClick={() => convert.mutate({ id })}
            className={`${btn} border-emerald-300/35 bg-emerald-300/[0.12] text-emerald-100 hover:bg-emerald-300/[0.2]`}
          >
            <Check className="h-3.5 w-3.5" />
            {convert.isPending ? "Convirtiendo…" : "Convertir en factura"}
          </button>
        )}

        {status !== "DRAFT" && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className={`${btn} border-white/12 bg-white/[0.03] text-foreground/80 hover:bg-white/[0.07]`}
          >
            <Copy className="h-3.5 w-3.5" /> {copied ? "Copiado ✓" : "Copiar link público"}
          </button>
        )}

        {confirmDelete ? (
          <span className="inline-flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => del.mutate({ id })}
              className={`${btn} border-rose-300/40 bg-rose-300/[0.1] text-rose-100 hover:bg-rose-300/[0.18]`}
            >
              {del.isPending ? "Borrando…" : "Confirmar borrar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            className={`${btn} border-white/10 bg-white/[0.02] text-muted-foreground hover:border-rose-300/30 hover:text-rose-100/85`}
          >
            <Trash2 className="h-3.5 w-3.5" /> Borrar
          </button>
        )}
      </div>

      {status === "ACCEPTED" && !hasClient && (
        <p className="text-xs text-muted-foreground">
          Para convertirlo en factura, primero creá el cliente en{" "}
          <a href="/dashboard/clients/new" className="underline underline-offset-2 hover:text-foreground">
            Clientes
          </a>{" "}
          y armale la factura desde su ficha.
        </p>
      )}
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </div>
  );
}
