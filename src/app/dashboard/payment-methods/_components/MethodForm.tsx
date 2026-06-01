"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";
import type { PaymentMethodConfigDto } from "@/lib/types";
import { CryptoAssetPicker } from "./CryptoAssetPicker";

type Kind = "BANK_ACCOUNT" | "CRYPTO_WALLET";

export function MethodForm({ existing }: { existing?: PaymentMethodConfigDto }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>(existing?.kind ?? "BANK_ACCOUNT");
  const [error, setError] = useState<string | null>(null);

  const create = trpc.paymentMethods.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard/payment-methods");
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  const update = trpc.paymentMethods.update.useMutation({
    onSuccess: () => {
      router.push("/dashboard/payment-methods");
      router.refresh();
    },
    onError: (e) => setError(e.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "").trim();
    const instructions = (fd.get("instructions") as string)?.trim() || null;
    const sortOrder = Number(fd.get("sortOrder") ?? 0);

    if (kind === "BANK_ACCOUNT") {
      const details = {
        bankName: String(fd.get("bankName") ?? "").trim(),
        accountHolder: String(fd.get("accountHolder") ?? "").trim(),
        cbu: String(fd.get("cbu") ?? "").trim(),
        alias: (fd.get("alias") as string)?.trim() || null,
        taxId: (fd.get("taxId") as string)?.trim() || null,
      };
      if (existing) {
        update.mutate({
          id: existing.id,
          kind: "BANK_ACCOUNT",
          label,
          instructions,
          sortOrder,
          details,
        });
      } else {
        create.mutate({ kind: "BANK_ACCOUNT", label, instructions, sortOrder, details });
      }
    } else {
      const details = {
        network: String(fd.get("network") ?? "").trim(),
        asset: String(fd.get("asset") ?? "").trim().toUpperCase(),
        address: String(fd.get("address") ?? "").trim(),
        memo: (fd.get("memo") as string)?.trim() || null,
      };
      if (existing) {
        update.mutate({
          id: existing.id,
          kind: "CRYPTO_WALLET",
          label,
          instructions,
          sortOrder,
          details,
        });
      } else {
        create.mutate({ kind: "CRYPTO_WALLET", label, instructions, sortOrder, details });
      }
    }
  }

  const isPending = create.isPending || update.isPending;
  const bankDetails =
    existing?.kind === "BANK_ACCOUNT" ? existing.details : null;
  const cryptoDetails =
    existing?.kind === "CRYPTO_WALLET" ? existing.details : null;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Section title="Tipo">
        <div className="grid gap-2 sm:grid-cols-2">
          <KindCard
            label="Cuenta bancaria"
            sub="CBU, alias, titular"
            active={kind === "BANK_ACCOUNT"}
            disabled={!!existing}
            onClick={() => setKind("BANK_ACCOUNT")}
          />
          <KindCard
            label="Wallet crypto"
            sub="USDT, BTC, USDC, etc."
            active={kind === "CRYPTO_WALLET"}
            disabled={!!existing}
            onClick={() => setKind("CRYPTO_WALLET")}
          />
        </div>
        {existing && (
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            El tipo no se puede cambiar después de creado.
          </p>
        )}
      </Section>

      <Section title="Visible en el portal">
        <Field
          name="label"
          label="Etiqueta"
          defaultValue={existing?.label}
          required
          hint="Lo que ve el cliente al elegir cómo pagar (ej. 'USDT (TRC20)' o 'Banco Galicia USD')"
        />
        <Field
          name="instructions"
          label="Instrucciones"
          defaultValue={existing?.instructions ?? ""}
          textarea
          hint="Mensaje breve con tips o advertencias para el cliente"
        />
        <Field
          name="sortOrder"
          label="Orden"
          type="number"
          defaultValue={String(existing?.sortOrder ?? 0)}
          hint="Menor número = más arriba en el listado del cliente"
        />
      </Section>

      {kind === "BANK_ACCOUNT" ? (
        <Section title="Datos bancarios">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="bankName" label="Banco" required defaultValue={bankDetails?.bankName} />
            <Field
              name="accountHolder"
              label="Titular"
              required
              defaultValue={bankDetails?.accountHolder}
            />
            <Field
              name="cbu"
              label="CBU / IBAN"
              required
              defaultValue={bankDetails?.cbu}
              className="sm:col-span-2"
            />
            <Field name="alias" label="Alias" defaultValue={bankDetails?.alias ?? ""} />
            <Field name="taxId" label="CUIT / Tax ID" defaultValue={bankDetails?.taxId ?? ""} />
          </div>
        </Section>
      ) : (
        <Section title="Datos de la wallet">
          <CryptoAssetPicker
            defaultAsset={cryptoDetails?.asset}
            defaultNetwork={cryptoDetails?.network}
          />
          <Field
            name="address"
            label="Dirección de la wallet"
            required
            defaultValue={cryptoDetails?.address}
          />
          <Field
            name="memo"
            label="Memo / tag"
            defaultValue={cryptoDetails?.memo ?? ""}
            hint="Solo si la red lo requiere"
          />
        </Section>
      )}

      <div className="flex items-center justify-between gap-4">
        {error && <p className="text-sm text-rose-200/85">{error}</p>}
        <div className="ml-auto">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full border border-white/18 bg-white/[0.07] px-5 py-2.5 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28 disabled:opacity-50"
          >
            {isPending ? "Guardando…" : existing ? "Guardar cambios" : "Crear método"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function KindCard({
  label,
  sub,
  active,
  disabled,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-white/22 bg-white/[0.07]"
          : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <p className="text-sm font-medium text-foreground/95">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </button>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
  defaultValue,
  hint,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  defaultValue?: string;
  hint?: string;
  className?: string;
}) {
  const baseInput =
    "glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55";
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-rose-200/70">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          rows={2}
          className={baseInput}
          required={required}
          defaultValue={defaultValue}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className={baseInput}
        />
      )}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground/70">{hint}</span>}
    </label>
  );
}
