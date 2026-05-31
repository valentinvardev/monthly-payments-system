"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/trpc/react";
import type { PaymentMethodConfig } from "@/lib/demo/types";
import {
  BankTransferIcon,
  CryptoIcon,
  MercadoPagoIcon,
} from "@/components/icons/PaymentMethodIcons";
import { CryptoAssetIcon } from "@/components/icons/CryptoAssetIcons";

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
        <CardContent className="py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-200/[0.06]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-emerald-100/90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display text-lg text-foreground/95">Listo</p>
          <p className="mt-1 text-sm text-muted-foreground">{done}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 py-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
            Elegí cómo pagar
          </p>
          <h2 className="mt-1 font-display text-base font-medium tracking-tight text-foreground/95">
            Tres caminos hacia el sur.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MethodCard
            label="MercadoPago"
            sub="Pago automatizado"
            tag="instantáneo"
            active={chosen === "MERCADOPAGO"}
            icon={<MercadoPagoIcon size={26} />}
            iconBare
            onClick={() => {
              setChosen("MERCADOPAGO");
              setChosenConfigId(null);
            }}
          />
          <MethodCard
            label="Transferencia"
            sub={`${banks.length} cuenta${banks.length === 1 ? "" : "s"} · USD`}
            tag="1–2 días"
            active={chosen === "BANK_TRANSFER"}
            icon={<BankTransferIcon size={22} />}
            onClick={() => {
              setChosen("BANK_TRANSFER");
              setChosenConfigId(banks[0]?.id ?? null);
            }}
          />
          <MethodCard
            label="Crypto"
            sub={`${cryptos.length} wallet${cryptos.length === 1 ? "" : "s"}`}
            tag="minutos"
            active={chosen === "CRYPTO"}
            icon={<CryptoIcon size={22} />}
            iconBare
            onClick={() => {
              setChosen("CRYPTO");
              setChosenConfigId(cryptos[0]?.id ?? null);
            }}
          />
        </div>

        {chosen === "MERCADOPAGO" && (
          <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <p className="text-sm text-muted-foreground">
              En modo real serías redirigido al checkout de MercadoPago y al confirmar el pago la
              factura quedaría marcada como pagada vía webhook.
            </p>
            <PrimaryButton
              disabled={mp.isPending}
              onClick={() => mp.mutate({ invoiceId })}
              label={mp.isPending ? "Procesando..." : "Simular pago con MercadoPago"}
            />
            {mp.error && <p className="text-sm text-rose-200/85">{mp.error.message}</p>}
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
            ctaLabel="Marcar como transferido + adjuntar comprobante"
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
            ctaLabel="Marcar como enviado + adjuntar hash"
          />
        )}
      </CardContent>
    </Card>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function MethodCard({
  label,
  sub,
  tag,
  active,
  icon,
  iconBare,
  onClick,
}: {
  label: string;
  sub: string;
  tag: string;
  active: boolean;
  icon: React.ReactNode;
  iconBare?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group/method relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-white/22 bg-white/[0.07]"
          : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        {iconBare ? (
          <div className="flex h-9 w-9 items-center justify-center text-foreground/85">
            {icon}
          </div>
        ) : (
          <div
            className={[
              "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
              active
                ? "border-white/15 bg-white/[0.08] text-foreground/95"
                : "border-white/6 bg-white/[0.03] text-foreground/70",
            ].join(" ")}
          >
            {icon}
          </div>
        )}
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground/85">
          {tag}
        </span>
      </div>
      <p className="mt-3 font-medium text-foreground/95">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
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
      <p className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm text-muted-foreground">
        No hay opciones configuradas para este método todavía.
      </p>
    );
  }

  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="space-y-2">
        {options.map((o) => {
          const isSel = o.id === selected.id;
          return (
            <label
              key={o.id}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition",
                isSel
                  ? "border-white/22 bg-white/[0.05]"
                  : "border-white/8 bg-white/[0.02] hover:border-white/14",
              ].join(" ")}
            >
              <input
                type="radio"
                name="manual-option"
                checked={isSel}
                onChange={() => onSelect(o.id)}
                className="mt-1 accent-foreground/70"
              />
              {o.kind === "CRYPTO_WALLET" && (
                <div className="mt-0.5 shrink-0">
                  <CryptoAssetIcon
                    asset={o.details.asset}
                    network={o.details.network}
                    size={32}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground/95">{o.label}</span>
                  {o.kind === "CRYPTO_WALLET" && (
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/85">
                      {o.details.network}
                    </span>
                  )}
                </div>
                {o.kind === "BANK_ACCOUNT" ? (
                  <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    <div>
                      <span className="text-foreground/55">CBU</span>{" "}
                      <span className="font-mono text-foreground/85">{o.details.cbu}</span>
                      {o.details.alias && (
                        <>
                          {" · "}
                          <span className="text-foreground/55">alias</span>{" "}
                          <span className="font-mono text-foreground/85">{o.details.alias}</span>
                        </>
                      )}
                    </div>
                    <div>
                      <span className="text-foreground/55">Titular</span>{" "}
                      <span className="text-foreground/85">{o.details.accountHolder}</span>
                      {o.details.taxId && (
                        <>
                          {" · "}
                          <span className="text-foreground/55">CUIT</span>{" "}
                          <span className="font-mono text-foreground/85">{o.details.taxId}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 break-all font-mono text-[11px] text-foreground/85">
                    {o.details.address}
                  </div>
                )}
                {o.instructions && (
                  <p className="mt-2 text-[11px] italic text-muted-foreground/70">
                    {o.instructions}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <textarea
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Notas opcionales (banco origen, hash de envío…)"
        className="glass-input focus:glass-input-focus w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
        rows={2}
      />

      <button
        type="button"
        disabled={isPending}
        onClick={onSubmit}
        className="w-full rounded-full border border-white/18 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : ctaLabel}
      </button>
      {error && <p className="text-sm text-rose-200/85">{error}</p>}
    </div>
  );
}
