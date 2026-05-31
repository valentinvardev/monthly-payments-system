import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { RateWidget } from "@/components/RateWidget";
import { api } from "@/trpc/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatUsd, daysUntil } from "@/lib/format";

export default async function PortalHome() {
  const [user, invoices] = await Promise.all([getCurrentUser(), api.invoices.listMine()]);
  const pendingOrOverdue = invoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE" || i.status === "PENDING_REVIEW",
  );
  const totalPending = pendingOrOverdue.reduce((a, i) => a + Number(i.amountUsd), 0);

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Portal del cliente
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Hola,{" "}
          <span className="font-light text-foreground/70">{(user?.fullName ?? user?.email ?? "").split(" ")[0]}.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acá vas a ver tus facturas y elegir cómo pagarlas.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 reveal" style={{ animationDelay: "60ms" }}>
        <RateWidget />
        <Card>
          <CardContent>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
              Pendiente de pago
            </p>
            <p className="font-display text-4xl font-light tabular-nums text-frost">
              {formatUsd(totalPending)}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {pendingOrOverdue.length} factura{pendingOrOverdue.length === 1 ? "" : "s"} abierta
              {pendingOrOverdue.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3 reveal" style={{ animationDelay: "120ms" }}>
        <div className="px-1">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground/95">
            Tus facturas
          </h2>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
            Tocá una para ver detalles y pagar
          </p>
        </div>

        {invoices.length === 0 && (
          <Card>
            <CardContent>
              <p className="py-3 text-sm text-muted-foreground">Todavía no hay facturas para vos.</p>
            </CardContent>
          </Card>
        )}

        {invoices.map((i) => {
          const days = daysUntil(i.dueDate);
          const isPaid = i.status === "PAID";
          const isOverdue = i.status === "OVERDUE" || (days < 0 && !isPaid);

          const overdueText = isPaid
            ? `Pagada ${i.paidAt ? formatDate(i.paidAt) : ""}`
            : days < 0
              ? `Vencida hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`
              : days === 0
                ? "Vence hoy"
                : `Vence en ${days} día${days === 1 ? "" : "s"}`;

          const accentStripe = isPaid
            ? "bg-emerald-200/45"
            : isOverdue
              ? "bg-rose-300/55"
              : "bg-foreground/30";

          return (
            <Link
              key={i.id}
              href={`/portal/invoice/${i.id}`}
              className="group relative block overflow-hidden rounded-2xl glass transition-all hover:bg-white/[0.06]"
            >
              <span className={`absolute left-0 top-0 h-full w-[2px] ${accentStripe}`} />
              <div className="flex items-center justify-between gap-4 p-5 pl-6">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground/95">{i.description}</p>
                    <InvoiceStatusBadge status={i.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vence <span className="text-foreground/75">{formatDate(i.dueDate)}</span>
                    {" · "}
                    <span
                      className={
                        isOverdue
                          ? "text-rose-100/85"
                          : isPaid
                            ? "text-emerald-100/85"
                            : "text-muted-foreground"
                      }
                    >
                      {overdueText}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-light tabular-nums text-frost">
                    {formatUsd(i.amountUsd)}
                  </p>
                  {!isPaid && (
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 transition-colors group-hover:text-foreground">
                      Pagar →
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
