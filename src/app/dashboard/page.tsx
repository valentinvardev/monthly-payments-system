import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RateWidget } from "@/components/RateWidget";
import { InvoiceStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { api } from "@/trpc/server";
import { formatDate, formatUsd } from "@/lib/format";
import { ConfirmPaymentButtons } from "./_components/ConfirmPaymentButtons";

export default async function DashboardHome() {
  const [clients, invoices, pendingReview] = await Promise.all([
    api.clients.list(),
    api.invoices.listAll(),
    api.payments.pendingReview(),
  ]);

  const totalOwedUsd = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE" || i.status === "PENDING_REVIEW")
    .reduce((acc, i) => acc + i.amountUsd, 0);

  const paidThisPeriodUsd = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + i.amountUsd, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Modo demo · datos en memoria · {clients.length} clientes activos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RateWidget />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por cobrar (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{formatUsd(totalOwedUsd)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pendientes + en revisión + vencidas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobrado (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{formatUsd(paidThisPeriodUsd)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Facturas con estado pagada</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Pagos esperando revisión</CardTitle>
          <span className="text-xs text-muted-foreground">{pendingReview.length} en cola</span>
        </CardHeader>
        <CardContent>
          {pendingReview.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay comprobantes pendientes de confirmar.
            </p>
          ) : (
            <ul className="divide-y">
              {pendingReview.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {p.client?.fullName} · {formatUsd(p.amountUsd)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.method} · {p.invoice?.description} ·{" "}
                      <a
                        href={p.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        ver comprobante
                      </a>
                    </p>
                    {p.notes && (
                      <p className="text-xs italic text-muted-foreground">"{p.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <PaymentStatusBadge status={p.status} />
                    <ConfirmPaymentButtons paymentId={p.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Últimas facturas</CardTitle>
          <Link href="/dashboard/invoices" className="text-xs text-muted-foreground hover:underline">
            Ver todas →
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 text-left font-medium">Cliente</th>
                <th className="px-6 py-2 text-left font-medium">Descripción</th>
                <th className="px-6 py-2 text-right font-medium">Monto</th>
                <th className="px-6 py-2 text-left font-medium">Vence</th>
                <th className="px-6 py-2 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.slice(0, 8).map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-3">{i.client?.fullName}</td>
                  <td className="px-6 py-3 text-muted-foreground">{i.description}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{formatUsd(i.amountUsd)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(i.dueDate)}</td>
                  <td className="px-6 py-3">
                    <InvoiceStatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
