"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import type { PaymentMethodConfigDto as PaymentMethodConfig } from "@/lib/types";
import {
  BankTransferIcon,
  CryptoIcon,
  MercadoPagoLogo,
} from "@/components/icons/PaymentMethodIcons";
import { CryptoAssetIcon } from "@/components/icons/CryptoAssetIcons";
import { ProofUpload } from "./ProofUpload";

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
  const [done, setDone] = useState<string | null>(null);

  const banks = methods.filter((m) => m.kind === "BANK_ACCOUNT");
  const cryptos = methods.filter((m) => m.kind === "CRYPTO_WALLET");

  const mp = trpc.payments.simulateMercadoPago.useMutation({
    onSuccess: () => {
      setDone("¡Pago acreditado! La factura quedó marcada como pagada.");
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
            Elegí cómo querés pagar.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MethodCard
            sub="Pago automatizado"
            tag="instantáneo"
            active={chosen === "MERCADOPAGO"}
            wordmark={
              <MercadoPagoLogo
                height={38}
                className="text-foreground/95 transition-transform group-hover/method:scale-[1.02]"
              />
            }
            onClick={() => setChosen("MERCADOPAGO")}
          />
          <MethodCard
            label="Transferencia"
            sub={`${banks.length} cuenta${banks.length === 1 ? "" : "s"} · USD`}
            tag="1–2 días"
            active={chosen === "BANK_TRANSFER"}
            icon={<BankTransferIcon size={22} />}
            onClick={() => setChosen("BANK_TRANSFER")}
          />
          <MethodCard
            label="Crypto"
            sub={`${cryptos.length} wallet${cryptos.length === 1 ? "" : "s"}`}
            tag="minutos"
            active={chosen === "CRYPTO"}
            icon={<CryptoIcon size={22} />}
            iconBare
            onClick={() => setChosen("CRYPTO")}
          />
        </div>

        {chosen === "MERCADOPAGO" && (
          <div className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
            <p className="text-sm text-muted-foreground">
              En modo real serías redirigido al checkout de MercadoPago y al confirmar el pago la
              factura quedaría marcada como pagada vía webhook.
            </p>
            <div className="flex justify-end">
              <PrimaryButton
                disabled={mp.isPending}
                onClick={() => mp.mutate({ invoiceId })}
                label={mp.isPending ? "Procesando..." : "Simular pago con MercadoPago"}
              />
            </div>
            {mp.error && <p className="text-sm text-rose-200/85">{mp.error.message}</p>}
          </div>
        )}

        {chosen === "BANK_TRANSFER" && (
          <BankTransferFlow
            invoiceId={invoiceId}
            options={banks}
            onDone={(msg) => setDone(msg)}
          />
        )}

        {chosen === "CRYPTO" && (
          <CryptoFlow
            invoiceId={invoiceId}
            options={cryptos}
            onDone={(msg) => setDone(msg)}
          />
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------
// Bank transfer flow — radio list of accounts + proof upload + notes
// -----------------------------------------------------------------------

function BankTransferFlow({
  invoiceId,
  options,
  onDone,
}: {
  invoiceId: string;
  options: PaymentMethodConfig[];
  onDone: (msg: string) => void;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(options[0]?.id ?? null);
  const [proof, setProof] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const mutation = trpc.payments.submitManualPayment.useMutation({
    onSuccess: () => {
      onDone("Recibimos tu comprobante. Vas a ver el pago como 'pagada' una vez que el admin lo confirme.");
      router.refresh();
    },
  });

  if (options.length === 0) {
    return (
      <p className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm text-muted-foreground">
        No hay cuentas bancarias configuradas todavía.
      </p>
    );
  }

  const canSubmit = !!selectedId;

  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="space-y-2">
        {options.map((o) => {
          if (o.kind !== "BANK_ACCOUNT") return null;
          const isSel = o.id === selectedId;
          return (
            <label
              key={o.id}
              className={[
                "group/opt flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition",
                isSel
                  ? "border-white/22 bg-white/[0.05]"
                  : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.035]",
              ].join(" ")}
            >
              <input
                type="radio"
                name="bank-option"
                checked={isSel}
                onChange={() => setSelectedId(o.id)}
                className="sr-only"
              />
              <CustomRadio checked={isSel} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground/95">{o.label}</div>
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

      <ProofUpload value={proof} onChange={setProof} hint="Captura de la transferencia (imagen o PDF)" />

      <NotesArea value={notes} onChange={setNotes} />

      <div className="flex justify-end">
        <PrimaryButton
          disabled={!canSubmit || mutation.isPending}
          onClick={() => {
            if (!selectedId) return;
            mutation.mutate({
              invoiceId,
              method: "BANK_TRANSFER",
              paymentMethodConfigId: selectedId,
              notes: notes || undefined,
              proofFileName: proof?.name,
            });
          }}
          label={mutation.isPending ? "Enviando..." : "Marcar como transferido"}
        />
      </div>
      {mutation.error && <p className="text-sm text-rose-200/85">{mutation.error.message}</p>}
    </div>
  );
}

// -----------------------------------------------------------------------
// Crypto flow — dropdown picker; address card reveals only after select
// -----------------------------------------------------------------------

function CryptoFlow({
  invoiceId,
  options,
  onDone,
}: {
  invoiceId: string;
  options: PaymentMethodConfig[];
  onDone: (msg: string) => void;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("");
  const [proof, setProof] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = trpc.payments.submitManualPayment.useMutation({
    onSuccess: () => {
      onDone("Recibimos tu comprobante. Vas a ver el pago como 'pagada' una vez que el admin lo confirme.");
      router.refresh();
    },
  });

  if (options.length === 0) {
    return (
      <p className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm text-muted-foreground">
        No hay wallets crypto configuradas todavía.
      </p>
    );
  }

  const selected = options.find((o) => o.id === selectedId);
  const canSubmit = !!selected;

  async function copyAddress() {
    if (!selected || selected.kind !== "CRYPTO_WALLET") return;
    try {
      await navigator.clipboard.writeText(selected.details.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Wallet de destino
        </label>
        <Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? "")}>
          <SelectTrigger className="!h-12 w-full justify-between rounded-xl border-white/12 bg-white/[0.03] px-3 text-left text-sm text-foreground/95 hover:border-white/22 hover:bg-white/[0.05] data-[popup-open]:border-white/30">
            <SelectValue placeholder="Elegí una red y activo">
              {selected && selected.kind === "CRYPTO_WALLET" && (
                <span className="flex items-center gap-2">
                  <CryptoAssetIcon
                    asset={selected.details.asset}
                    network={selected.details.network}
                    size={22}
                  />
                  <span className="font-medium text-foreground/95">
                    {selected.details.asset}
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/85">
                    {selected.details.network}
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/12 !bg-transparent">
            {options.map((o) => {
              if (o.kind !== "CRYPTO_WALLET") return null;
              return (
                <SelectItem
                  key={o.id}
                  value={o.id}
                  className="!gap-3 !rounded-md !py-2 !pl-2 hover:!bg-white/[0.06] focus:!bg-white/[0.08]"
                >
                  <CryptoAssetIcon
                    asset={o.details.asset}
                    network={o.details.network}
                    size={22}
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-foreground/95">
                      {o.details.asset}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {o.details.network}
                    </span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {selected && selected.kind === "CRYPTO_WALLET" && (
        <div className="reveal space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <CryptoAssetIcon
                asset={selected.details.asset}
                network={selected.details.network}
                size={38}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground/95">{selected.label}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/85">
                  {selected.details.network} · {selected.details.asset}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                Dirección
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-2">
                <code className="min-w-0 flex-1 break-all font-mono text-[11px] text-foreground/90">
                  {selected.details.address}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="shrink-0 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground/95 hover:border-white/22 transition"
                >
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
            {selected.instructions && (
              <p className="mt-3 text-[11px] italic text-muted-foreground/75">
                {selected.instructions}
              </p>
            )}
          </div>

          <ProofUpload
            value={proof}
            onChange={setProof}
            hint="Captura del envío o hash de la transacción"
          />

          <NotesArea value={notes} onChange={setNotes} placeholder="Notas opcionales (hash, exchange origen…)" />

          <div className="flex justify-end">
            <PrimaryButton
              disabled={!canSubmit || mutation.isPending}
              onClick={() => {
                if (!selected) return;
                mutation.mutate({
                  invoiceId,
                  method: "CRYPTO",
                  paymentMethodConfigId: selected.id,
                  notes: notes || undefined,
                  proofFileName: proof?.name,
                });
              }}
              label={mutation.isPending ? "Enviando..." : "Confirmar envío"}
            />
          </div>
          {mutation.error && (
            <p className="text-sm text-rose-200/85">{mutation.error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Small shared bits
// -----------------------------------------------------------------------

function NotesArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Notas opcionales (banco origen, hash de envío…)"}
      className="glass-input focus:glass-input-focus w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
      rows={2}
    />
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
      className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-40 disabled:hover:bg-white/[0.07] disabled:hover:border-white/18"
    >
      {label}
    </button>
  );
}

function CustomRadio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-200",
        checked
          ? "border-foreground/55 bg-foreground/[0.10] shadow-[inset_0_0_0_1px_oklch(0.85_0.04_220/0.25)]"
          : "border-white/15 bg-white/[0.03] group-hover/opt:border-white/30",
      ].join(" ")}
    >
      <span
        className={[
          "h-[7px] w-[7px] rounded-full bg-foreground/95 transition-all duration-200",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        ].join(" ")}
      />
    </span>
  );
}

function MethodCard({
  label,
  sub,
  tag,
  active,
  icon,
  iconBare,
  wordmark,
  onClick,
}: {
  label?: string;
  sub: string;
  tag: string;
  active: boolean;
  icon?: React.ReactNode;
  iconBare?: boolean;
  wordmark?: React.ReactNode;
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
      <div className="flex items-start justify-between gap-2">
        {wordmark ? (
          <div className="flex min-h-9 items-center pt-0.5">{wordmark}</div>
        ) : iconBare ? (
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
        <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground/85">
          {tag}
        </span>
      </div>
      {label && <p className="mt-3 font-medium text-foreground/95">{label}</p>}
      <p className={wordmark && !label ? "mt-4 text-xs text-muted-foreground" : "text-xs text-muted-foreground"}>
        {sub}
      </p>
    </button>
  );
}
