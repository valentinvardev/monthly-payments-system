import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RateWidget } from "@/components/RateWidget";
import { InvoiceStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { api } from "@/trpc/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatUsd } from "@/lib/format";
import { ConfirmPaymentButtons } from "./_components/ConfirmPaymentButtons";
import { ProofModal } from "./_components/ProofModal";

export default async function DashboardHome() {
  const [user, clients, invoices, pendingReview] = await Promise.all([
    getCurrentUser(),
    api.clients.list(),
    api.invoices.listAll(),
    api.payments.pendingReview(),
  ]);

  const totalOwedUsd = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE" || i.status === "PENDING_REVIEW")
    .reduce((acc, i) => acc + Number(i.amountUsd), 0);

  const paidThisPeriodUsd = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + Number(i.amountUsd), 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Resumen
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          {greeting},{" "}
          <span className="font-light text-foreground/70">{(user?.fullName ?? user?.email ?? "").split(" ")[0]}.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clients.length} clientes activos · {invoices.length} facturas en el sistema
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3 reveal" style={{ animationDelay: "60ms" }}>
        <RateWidget />
        <Kpi label="Por cobrar" amount={totalOwedUsd} hint="Pendientes + revisión + vencidas" />
        <Kpi label="Cobrado" amount={paidThisPeriodUsd} hint="Facturas con estado pagada" />
      </div>

      <section className="reveal" style={{ animationDelay: "120ms" }}>
        <SectionHeader
          title="Pagos esperando revisión"
          subtitle={`${pendingReview.length} en cola`}
        />
        <Card className="mt-3">
          {pendingReview.length === 0 ? (
            <CardContent>
              <p className="py-4 text-sm text-muted-foreground">
                No hay comprobantes pendientes de confirmar.
              </p>
            </CardContent>
          ) : (
            <ul className="divide-y divide-white/6">
              {pendingReview.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground/95">
                      {p.client?.fullName}
                      <span className="ml-2 font-display tabular-nums text-foreground/70">
                        {formatUsd(p.amountUsd)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="rounded-md border border-white/6 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase">
                        {p.method}
                      </span>{" "}
                      · {p.invoice?.description} ·{" "}
                      {p.proofSignedUrl ? (
                        <ProofModal url={p.proofSignedUrl} />
                      ) : (
                        <span className="text-muted-foreground/60">sin comprobante</span>
                      )}
                    </p>
                    {p.notes && (
                      <p className="text-xs italic text-muted-foreground/80">"{p.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <PaymentStatusBadge status={p.status} />
                    <ConfirmPaymentButtons paymentId={p.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="reveal" style={{ animationDelay: "180ms" }}>
        <SectionHeader
          title="Últimas facturas"
          action={
            <Link
              href="/dashboard/invoices"
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Ver todas →
            </Link>
          }
        />
        <Card className="mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                  <th className="px-5 py-3 text-left font-medium">Cliente</th>
                  <th className="px-5 py-3 text-left font-medium">Descripción</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                  <th className="px-5 py-3 text-left font-medium">Vence</th>
                  <th className="px-5 py-3 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {invoices.slice(0, 8).map((i) => (
                  <tr
                    key={i.id}
                    className="transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-3.5 text-foreground/95">{i.client?.fullName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{i.description}</td>
                    <td className="px-5 py-3.5 text-right font-display tabular-nums text-foreground/95">
                      {formatUsd(i.amountUsd)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(i.dueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <InvoiceStatusBadge status={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 px-1">
      <div>
        <h2 className="font-display text-base font-medium tracking-tight text-foreground/95">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Kpi({
  label,
  amount,
  hint,
}: {
  label: string;
  amount: number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          {label}
        </p>
        <p className="font-display text-4xl font-light tabular-nums text-frost">
          {formatUsd(amount)}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
          {hint}
        </p>
      </CardContent>
    </Card>
  );
}
