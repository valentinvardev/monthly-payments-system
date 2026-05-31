import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { api } from "@/trpc/server";
import { formatDate, formatUsd } from "@/lib/format";

export default async function InvoicesPage() {
  const invoices = await api.invoices.listAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
        <p className="text-sm text-muted-foreground">{invoices.length} facturas en el sistema</p>
      </div>

      <Card>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 text-left font-medium">Cliente</th>
                <th className="px-6 py-2 text-left font-medium">Descripción</th>
                <th className="px-6 py-2 text-left font-medium">Período</th>
                <th className="px-6 py-2 text-right font-medium">Monto</th>
                <th className="px-6 py-2 text-left font-medium">Vence</th>
                <th className="px-6 py-2 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-3">{i.client?.fullName}</td>
                  <td className="px-6 py-3 text-muted-foreground">{i.description}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {formatDate(i.periodStart)} – {formatDate(i.periodEnd)}
                  </td>
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
