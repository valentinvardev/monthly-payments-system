import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { formatDate, formatUsd } from "@/lib/format";
import { formatFrequency } from "@/lib/recurrence";
import { InviteLinkButton } from "./_components/InviteLinkButton";

export default async function ClientsPage() {
  const clients = await api.clients.list();

  return (
    <div className="space-y-8">
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="studio-eyebrow">
            Clientes
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
            Tu <span className="font-light text-foreground/70">cartera</span>.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {clients.length} cliente{clients.length === 1 ? "" : "s"} · Suma mensual{" "}
            <span className="font-display text-foreground/90 tabular-nums">
              {formatUsd(
                clients.reduce((acc, c) => acc + Number(c.plan?.amountUsd ?? 0), 0),
              )}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-1.5 rounded-none border border-[#0070F3] bg-[#0070F3] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0060d3] hover:border-[#0060d3]"
        >
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Link>
      </header>

      <Card className="reveal" style={{ animationDelay: "60ms" } as React.CSSProperties}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                <th className="px-5 py-3 text-left font-medium">Cliente</th>
                <th className="px-5 py-3 text-left font-medium">Plan recurrente</th>
                <th className="px-5 py-3 text-right font-medium">Monto</th>
                <th className="px-5 py-3 text-left font-medium">Frecuencia</th>
                <th className="px-5 py-3 text-right font-medium">Facturas</th>
                <th className="px-5 py-3 text-left font-medium">Alta</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {clients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Todavía no hay clientes. Tocá{" "}
                    <span className="text-foreground/85">Nuevo cliente</span> para crear el primero.
                  </td>
                </tr>
              )}
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
                    {c.plan ? formatFrequency(c.plan.frequency) : "—"}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-foreground/80">
                    {c.invoiceCount}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <InviteLinkButton clientId={c.id} hasLogin={c.hasLogin} />
                      <Link
                        href={`/dashboard/clients/${c.id}`}
                        className="inline-flex items-center gap-1 rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/90 transition hover:bg-white/[0.10] hover:border-white/25"
                      >
                        Gestionar <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
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
