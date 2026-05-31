import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { api } from "@/trpc/server";
import { formatDate, formatDateTime, formatUsd, formatArs } from "@/lib/format";
import { getUsdToArsRate } from "@/lib/exchange-rate";
import { PayFlow } from "./_components/PayFlow";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const arsPreview = rate
    ? Math.round(invoice.amountUsd * rate.rate * 100) / 100
    : null;

  return (
    <div className="space-y-6">
      <Link href="/portal" className="text-xs text-muted-foreground hover:underline">
        ← Volver a mis pagos
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">{invoice.description}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Período {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)} ·
                Vence {formatDate(invoice.dueDate)}
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-semibold tabular-nums">{formatUsd(invoice.amountUsd)}</p>
          {arsPreview !== null && (
            <p className="text-sm text-muted-foreground">
              ≈ {formatArs(arsPreview)} a la cotización cripto actual (1 USD ={" "}
              {formatArs(rate!.rate)})
            </p>
          )}
        </CardContent>
      </Card>

      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pagos registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoice.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {p.method} · {formatUsd(p.amountUsd)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(p.createdAt)}
                    {p.externalId && ` · ${p.externalId}`}
                  </p>
                </div>
                <PaymentStatusBadge status={p.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {invoice.status !== "PAID" && (
        <PayFlow invoiceId={invoice.id} methods={methods} />
      )}
    </div>
  );
}
