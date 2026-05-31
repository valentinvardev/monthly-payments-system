import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { RateWidget } from "@/components/RateWidget";
import { api } from "@/trpc/server";
import { formatDate, formatUsd, daysUntil } from "@/lib/format";

export default async function PortalHome() {
  const invoices = await api.invoices.listMine();
  const pendingOrOverdue = invoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE" || i.status === "PENDING_REVIEW",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mis pagos</h1>
        <p className="text-sm text-muted-foreground">
          Acá vas a ver tus facturas y elegir cómo pagarlas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RateWidget />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendiente de pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {formatUsd(pendingOrOverdue.reduce((a, i) => a + i.amountUsd, 0))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pendingOrOverdue.length} factura{pendingOrOverdue.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay facturas para vos.</p>
          )}
          {invoices.map((i) => {
            const days = daysUntil(i.dueDate);
            const overdueText =
              i.status === "PAID"
                ? `Pagada ${i.paidAt ? formatDate(i.paidAt) : ""}`
                : days < 0
                  ? `Vencida hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`
                  : days === 0
                    ? "Vence hoy"
                    : `Vence en ${days} día${days === 1 ? "" : "s"}`;

            return (
              <Link
                key={i.id}
                href={`/portal/invoice/${i.id}`}
                className="block rounded-lg border p-4 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{i.description}</p>
                      <InvoiceStatusBadge status={i.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Vencimiento {formatDate(i.dueDate)} · {overdueText}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums">
                      {formatUsd(i.amountUsd)}
                    </p>
                    {i.status !== "PAID" && (
                      <p className="text-xs text-primary">Pagar →</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
