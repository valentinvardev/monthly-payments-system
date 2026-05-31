"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/react";
import type { PaymentMethodConfig } from "@/lib/demo/types";

type Method = "MERCADOPAGO" | "BANK_TRANSFER" | "CRYPTO";

export function PayFlow({
  invoiceId,
  methods,
}: {
  invoiceId: string;
  methods: PaymentMethodConfig[];
}) {
  const router = useRouter();
  const [chosen, setChosen] = useState<Method | null>(null);
  const [chosenConfigId, setChosenConfigId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const banks = methods.filter((m) => m.kind === "BANK_ACCOUNT");
  const cryptos = methods.filter((m) => m.kind === "CRYPTO_WALLET");

  const mp = trpc.payments.simulateMercadoPago.useMutation({
    onSuccess: () => {
      setDone("¡Pago acreditado! La factura quedó marcada como pagada.");
      router.refresh();
    },
  });

  const manual = trpc.payments.submitManualPayment.useMutation({
    onSuccess: () => {
      setDone(
        "Recibimos tu comprobante. Vas a ver el pago como 'pagada' una vez que el admin lo confirme.",
      );
      router.refresh();
    },
  });

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{done}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Elegí cómo pagar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <MethodCard
            label="MercadoPago"
            sub="Pago automatizado (demo)"
            active={chosen === "MERCADOPAGO"}
            onClick={() => {
              setChosen("MERCADOPAGO");
              setChosenConfigId(null);
            }}
          />
          <MethodCard
            label="Transferencia bancaria"
            sub={`${banks.length} cuenta${banks.length === 1 ? "" : "s"}`}
            active={chosen === "BANK_TRANSFER"}
            onClick={() => {
              setChosen("BANK_TRANSFER");
              setChosenConfigId(banks[0]?.id ?? null);
            }}
          />
          <MethodCard
            label="Crypto"
            sub={`${cryptos.length} wallet${cryptos.length === 1 ? "" : "s"}`}
            active={chosen === "CRYPTO"}
            onClick={() => {
              setChosen("CRYPTO");
              setChosenConfigId(cryptos[0]?.id ?? null);
            }}
          />
        </div>

        {chosen === "MERCADOPAGO" && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm">
              En modo real serías redirigido al checkout de MercadoPago y al confirmar el pago la
              factura quedaría marcada como pagada automáticamente vía webhook.
            </p>
            <button
              type="button"
              disabled={mp.isPending}
              onClick={() => mp.mutate({ invoiceId })}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
            >
              {mp.isPending ? "Procesando..." : "Simular pago con MercadoPago"}
            </button>
            {mp.error && <p className="text-sm text-red-600">{mp.error.message}</p>}
          </div>
        )}

        {chosen === "BANK_TRANSFER" && (
          <ManualFlow
            options={banks}
            selectedId={chosenConfigId}
            onSelect={setChosenConfigId}
            notes={notes}
            onNotes={setNotes}
            isPending={manual.isPending}
            error={manual.error?.message}
            onSubmit={() => {
              if (!chosenConfigId) return;
              manual.mutate({
                invoiceId,
                method: "BANK_TRANSFER",
                paymentMethodConfigId: chosenConfigId,
                notes: notes || undefined,
              });
            }}
            ctaLabel="Marcar como transferido + subir comprobante (demo)"
          />
        )}

        {chosen === "CRYPTO" && (
          <ManualFlow
            options={cryptos}
            selectedId={chosenConfigId}
            onSelect={setChosenConfigId}
            notes={notes}
            onNotes={setNotes}
            isPending={manual.isPending}
            error={manual.error?.message}
            onSubmit={() => {
              if (!chosenConfigId) return;
              manual.mutate({
                invoiceId,
                method: "CRYPTO",
                paymentMethodConfigId: chosenConfigId,
                notes: notes || undefined,
              });
            }}
            ctaLabel="Marcar como enviado + subir hash (demo)"
          />
        )}
      </CardContent>
    </Card>
  );
}

function MethodCard({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left text-sm transition ${
        active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}

function ManualFlow({
  options,
  selectedId,
  onSelect,
  notes,
  onNotes,
  isPending,
  error,
  onSubmit,
  ctaLabel,
}: {
  options: PaymentMethodConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  notes: string;
  onNotes: (v: string) => void;
  isPending: boolean;
  error?: string;
  onSubmit: () => void;
  ctaLabel: string;
}) {
  if (options.length === 0) {
    return (
      <p className="rounded-lg border p-4 text-sm text-muted-foreground">
        No hay opciones configuradas para este método todavía.
      </p>
    );
  }

  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-2">
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex cursor-pointer items-start gap-3 rounded-md border bg-background p-3 text-sm ${
              o.id === selected.id ? "border-primary" : ""
            }`}
          >
            <input
              type="radio"
              name="manual-option"
              checked={o.id === selected.id}
              onChange={() => onSelect(o.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium">{o.label}</div>
              {o.kind === "BANK_ACCOUNT" ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  CBU {o.details.cbu}
                  {o.details.alias && ` · alias ${o.details.alias}`}
                  <br />
                  Titular {o.details.accountHolder}
                  {o.details.taxId && ` · CUIT ${o.details.taxId}`}
                </div>
              ) : (
                <div className="mt-1 text-xs text-muted-foreground">
                  {o.details.network} · {o.details.asset}
                  <br />
                  <span className="break-all font-mono">{o.details.address}</span>
                </div>
              )}
              {o.instructions && (
                <p className="mt-1 text-xs italic text-muted-foreground">{o.instructions}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Notas opcionales (ej. desde qué banco transferiste, hash del envío...)"
        className="w-full rounded-md border bg-background p-2 text-sm"
        rows={2}
      />

      <button
        type="button"
        disabled={isPending}
        onClick={onSubmit}
        className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : ctaLabel}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
