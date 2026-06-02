import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { api } from "@/trpc/server";
import { formatDate, formatDateTime, formatUsd, formatArs } from "@/lib/format";
import { getUsdToArsRate } from "@/lib/exchange-rate";
import { PayFlow } from "./_components/PayFlow";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mp_status?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  let invoice;
  try {
    invoice = await api.invoices.get({ id });
  } catch {
    notFound();
  }

  const [methods, rate] = await Promise.all([
    api.paymentMethods.list(),
    getUsdToArsRate().catch(() => null),
  ]);

  const mpStatus = sp.mp_status;

  const amountUsd = Number(invoice.amountUsd);
  const arsPreview = rate ? Math.round(amountUsd * rate.rate * 100) / 100 : null;

  return (
    <div className="space-y-6">
      <Link
        href="/portal"
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
      >
        ← Volver
      </Link>

      {mpStatus === "success" && (
        <div className="rounded-2xl border border-emerald-200/25 bg-emerald-200/[0.06] p-4 text-sm text-emerald-100/95">
          ✓ Mercado Pago confirmó tu pago. La factura va a marcarse como pagada en unos segundos.
        </div>
      )}
      {mpStatus === "pending" && (
        <div className="rounded-2xl border border-yellow-200/25 bg-yellow-200/[0.06] p-4 text-sm text-yellow-100/95">
          ⏳ Tu pago está siendo procesado por Mercado Pago. En cuanto se confirme la factura queda
          pagada.
        </div>
      )}
      {mpStatus === "failure" && (
        <div className="rounded-2xl border border-rose-300/25 bg-rose-300/[0.08] p-4 text-sm text-rose-100/95">
          ✗ No pudimos completar el pago en Mercado Pago. Podés volver a intentarlo o usar otro
          método más abajo.
        </div>
      )}

      <Card className="reveal">
        <div className="px-5 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                Factura
              </p>
              <h1 className="font-display text-2xl font-medium leading-tight text-foreground/95">
                {invoice.description}
              </h1>
              <p className="text-xs text-muted-foreground">
                Período {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)} · Vence{" "}
                <span className="text-foreground/80">{formatDate(invoice.dueDate)}</span>
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>

        <CardContent className="pt-4 pb-6">
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
              Total
            </p>
            <p className="mt-1 font-display text-6xl font-light tabular-nums text-frost">
              {formatUsd(invoice.amountUsd)}
            </p>

            {arsPreview !== null && rate ? (
              <div className="mt-5 border-t border-white/8 pt-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                  Equivalente en pesos
                </p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-muted-foreground/70 text-base">≈</span>
                  <span className="font-display text-3xl font-light tabular-nums text-foreground/95">
                    {formatArs(arsPreview)}
                  </span>
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
                  cotización dólar oficial · 1 USD ={" "}
                  <span className="tabular-nums text-foreground/80">
                    {formatArs(rate.rate)}
                  </span>{" "}
                  · {rate.cached ? "cache" : "live"}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                No se pudo obtener la cotización en ARS.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {invoice.payments.length > 0 && (
        <Card className="reveal" style={{ animationDelay: "60ms" } as React.CSSProperties}>
          <CardContent className="space-y-2 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
              Pagos registrados
            </p>
            {invoice.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground/95">
                    <span className="rounded-md border border-white/6 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase">
                      {p.method}
                    </span>{" "}
                    <span className="font-display tabular-nums">{formatUsd(p.amountUsd)}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(p.createdAt)}
                    {p.externalId && (
                      <>
                        {" · "}
                        <span className="font-mono">{p.externalId}</span>
                      </>
                    )}
                  </p>
                </div>
                <PaymentStatusBadge status={p.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {invoice.status !== "PAID" && (
        <div className="reveal" style={{ animationDelay: "120ms" }}>
          <PayFlow invoiceId={invoice.id} methods={methods} />
        </div>
      )}
    </div>
  );
}
