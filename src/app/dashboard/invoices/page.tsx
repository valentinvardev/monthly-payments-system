import { Card } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { api } from "@/trpc/server";
import { formatDate, formatUsd } from "@/lib/format";

export default async function InvoicesPage() {
  const invoices = await api.invoices.listAll();

  const byStatus = invoices.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Facturas
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Movimiento <span className="font-light text-foreground/70">por cliente</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {invoices.length} facturas ·{" "}
          {Object.entries(byStatus)
            .map(([s, n]) => `${n} ${s.toLowerCase().replace("_", " ")}`)
            .join(" · ")}
        </p>
      </header>

      <Card className="reveal" style={{ animationDelay: "60ms" } as React.CSSProperties}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                <th className="px-5 py-3 text-left font-medium">Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Descripción</th>
                <th className="px-5 py-3 text-left font-medium">Período</th>
                <th className="px-5 py-3 text-right font-medium">Monto</th>
                <th className="px-5 py-3 text-left font-medium">Vence</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {invoices.map((i) => (
                <tr key={i.id} className="transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5 text-foreground/95">{i.client?.fullName}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{i.description}</td>
                  <td className="px-5 py-3.5 text-[11px] text-muted-foreground">
                    {formatDate(i.periodStart)} – {formatDate(i.periodEnd)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-display tabular-nums text-foreground/95">
                    {formatUsd(i.amountUsd)}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDate(i.dueDate)}</td>
                  <td className="px-5 py-3.5">
                    <InvoiceStatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
