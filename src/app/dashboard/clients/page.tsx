import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { formatDate, formatUsd } from "@/lib/format";
import { GenerateInvoiceButton } from "./_components/GenerateInvoiceButton";

export default async function ClientsPage() {
  const clients = await api.clients.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {clients.length} cliente{clients.length === 1 ? "" : "s"} activos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-2 text-left font-medium">Cliente</th>
                <th className="px-6 py-2 text-left font-medium">Plan recurrente</th>
                <th className="px-6 py-2 text-right font-medium">Monto / mes</th>
                <th className="px-6 py-2 text-left font-medium">Día vto.</th>
                <th className="px-6 py-2 text-right font-medium">Facturas</th>
                <th className="px-6 py-2 text-left font-medium">Alta</th>
                <th className="px-6 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-3">
                    <div className="font-medium">{c.fullName}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {c.plan?.description ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums">
                    {c.plan ? formatUsd(c.plan.amountUsd) : "—"}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {c.plan?.dueDayOfMonth ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums">{c.invoiceCount}</td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-6 py-3 text-right">
                    <GenerateInvoiceButton clientId={c.id} hasPlan={!!c.plan} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        En modo demo el alta de clientes y planes se hace por código. El alta desde UI llega en
        Fase 1.
      </p>
    </div>
  );
}
