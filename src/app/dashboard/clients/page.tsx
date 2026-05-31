import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { formatDate, formatUsd } from "@/lib/format";
import { GenerateInvoiceButton } from "./_components/GenerateInvoiceButton";
import { InviteLinkButton } from "./_components/InviteLinkButton";

export default async function ClientsPage() {
  const clients = await api.clients.list();

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Clientes
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Tu <span className="font-light text-foreground/70">cartera</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clients.length} cliente{clients.length === 1 ? "" : "s"} activos · Suma mensual{" "}
          <span className="font-display text-foreground/90 tabular-nums">
            {formatUsd(
              clients.reduce((acc, c) => acc + Number(c.plan?.amountUsd ?? 0), 0),
            )}
          </span>
        </p>
      </header>

      <Card className="reveal" style={{ animationDelay: "60ms" } as React.CSSProperties}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                <th className="px-5 py-3 text-left font-medium">Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Plan recurrente</th>
                <th className="px-5 py-3 text-right font-medium">Monto / mes</th>
                <th className="px-5 py-3 text-left font-medium">Día vto.</th>
                <th className="px-5 py-3 text-right font-medium">Facturas</th>
                <th className="px-5 py-3 text-left font-medium">Alta</th>
                <th className="px-5 py-3 text-right font-medium">Invite</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {clients.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground/95">{c.fullName}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {c.plan?.description ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-right font-display tabular-nums text-foreground/95">
                    {c.plan ? formatUsd(c.plan.amountUsd) : "—"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {c.plan?.dueDayOfMonth ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-foreground/80">
                    {c.invoiceCount}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <InviteLinkButton clientId={c.id} hasLogin={c.hasLogin} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <GenerateInvoiceButton clientId={c.id} hasPlan={!!c.plan} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground/70">
        En modo demo el alta de clientes y planes se hace por código.
      </p>
    </div>
  );
}
