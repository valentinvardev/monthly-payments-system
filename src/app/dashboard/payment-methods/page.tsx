import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { CryptoAssetIcon } from "@/components/icons/CryptoAssetIcons";
import { BankTransferIcon } from "@/components/icons/PaymentMethodIcons";
import { ToggleMethodActive } from "./_components/ToggleMethodActive";
import { DeleteMethodButton } from "./_components/DeleteMethodButton";
import { MercadoPagoConnectCard } from "./_components/MercadoPagoConnectCard";

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ mp?: string; mp_error?: string }>;
}) {
  const [methods, mp, sp] = await Promise.all([
    api.paymentMethods.listAll(),
    api.mercadoPago.getConnection(),
    searchParams,
  ]);
  const banks = methods.filter((m) => m.kind === "BANK_ACCOUNT");
  const cryptos = methods.filter((m) => m.kind === "CRYPTO_WALLET");

  return (
    <div className="space-y-8">
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="studio-eyebrow">
            Métodos de pago
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
            Cómo te <span className="font-light text-foreground/70">cobran</span>.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Los métodos activos aparecen en el portal de tus clientes al momento de pagar.
          </p>
        </div>
        <Link
          href="/dashboard/payment-methods/new"
          className="inline-flex items-center gap-1.5 rounded-none border border-[#0070F3] bg-[#0070F3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0060d3] hover:border-[#0060d3]"
        >
          <Plus className="h-4 w-4" /> Agregar método
        </Link>
      </header>

      <section className="reveal" style={{ animationDelay: "30ms" }}>
        <MercadoPagoConnectCard
          initialConnection={mp.connection}
          configured={mp.configured}
          errorParam={sp.mp_error ?? null}
          successParam={sp.mp ?? null}
        />
      </section>

      <Section title="Cuentas bancarias" count={banks.length}>
        {banks.length === 0 ? (
          <Empty label="cuenta bancaria" />
        ) : (
          <div className="space-y-2">
            {banks.map((m) =>
              m.kind === "BANK_ACCOUNT" ? (
                <MethodRow key={m.id} id={m.id} active={m.active}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-[#161616] text-foreground/85">
                    <BankTransferIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground/95">{m.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.details.bankName} · CBU{" "}
                      <span className="font-mono text-foreground/85">{m.details.cbu}</span>
                      {m.details.alias && (
                        <>
                          {" · "}alias{" "}
                          <span className="font-mono text-foreground/85">{m.details.alias}</span>
                        </>
                      )}
                    </p>
                  </div>
                </MethodRow>
              ) : null,
            )}
          </div>
        )}
      </Section>

      <Section title="Wallets crypto" count={cryptos.length}>
        {cryptos.length === 0 ? (
          <Empty label="wallet" />
        ) : (
          <div className="space-y-2">
            {cryptos.map((m) =>
              m.kind === "CRYPTO_WALLET" ? (
                <MethodRow key={m.id} id={m.id} active={m.active}>
                  <div className="shrink-0">
                    <CryptoAssetIcon
                      asset={m.details.asset}
                      network={m.details.network}
                      size={40}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-foreground/95">
                      {m.label}
                      <span className="rounded-none border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/85">
                        {m.details.network}
                      </span>
                    </p>
                    <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground/85">
                      {m.details.address}
                    </p>
                  </div>
                </MethodRow>
              ) : null,
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="reveal" style={{ animationDelay: "60ms" }}>
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground/95">
          {title}
        </h2>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

function MethodRow({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 py-1">
          {children}
          <div className="ml-auto flex items-center gap-2">
            {!active && (
              <span className="rounded-none border border-white/12 bg-[#161616] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                Pausado
              </span>
            )}
            <ToggleMethodActive id={id} active={active} />
            <Link
              href={`/dashboard/payment-methods/${id}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-none border border-white/12 bg-[#161616] text-foreground/80 transition hover:bg-[#1f1f1f] hover:border-white/25 hover:text-foreground"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <DeleteMethodButton id={id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <Card>
      <CardContent>
        <p className="py-3 text-sm text-muted-foreground">
          Todavía no cargaste ninguna {label}. Tocá <span className="text-foreground/85">Agregar método</span>{" "}
          arriba a la derecha.
        </p>
      </CardContent>
    </Card>
  );
}
