import Link from "next/link";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { formatUsd } from "@/lib/format";
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_STYLE } from "./_components/quote-ui";

export default async function QuotesPage() {
  const quotes = await api.quotes.list();

  return (
    <div className="space-y-8">
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
            Presupuestos
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
            Propuestas <span className="font-light text-foreground/70">sobre la mesa</span>.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{quotes.length} presupuestos</p>
        </div>
        <Link
          href="/dashboard/quotes/new"
          className="rounded-full border border-white/18 bg-white/[0.07] px-4 py-2 text-sm font-medium text-foreground/95 transition hover:bg-white/[0.12] hover:border-white/28"
        >
          + Nuevo presupuesto
        </Link>
      </header>

      <Card className="reveal" style={{ animationDelay: "60ms" } as React.CSSProperties}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                <th className="px-5 py-3 text-left font-medium">Título</th>
                <th className="px-5 py-3 text-left font-medium">Para</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-left font-medium">Estado</th>
                <th className="px-5 py-3 text-left font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Sin presupuestos todavía. Creá el primero.
                  </td>
                </tr>
              )}
              {quotes.map((q) => {
                const total = q.items.reduce((acc, i) => acc + Number(i.amountUsd), 0);
                return (
                  <tr key={q.id} className="transition-colors hover:bg-white/[0.025]">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/quotes/${q.id}`}
                        className="text-foreground/95 hover:text-foreground underline-offset-2 hover:underline"
                      >
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {q.name}
                      {q.company && <span className="text-muted-foreground/60"> · {q.company}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-display tabular-nums text-foreground/95">
                      {formatUsd(total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.16em] ${QUOTE_STATUS_STYLE[q.status]}`}
                      >
                        {QUOTE_STATUS_LABEL[q.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(q.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
