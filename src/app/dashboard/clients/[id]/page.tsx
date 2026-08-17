import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { formatDate, formatDateTime, formatUsd } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { DeleteInvoiceButton } from "@/app/dashboard/_components/DeleteInvoiceButton";
import { EditClientForm } from "./_components/EditClientForm";
import { ToggleActiveButton } from "./_components/ToggleActiveButton";
import { PlanSection } from "./_components/PlanSection";
import { ClientInviteAction } from "./_components/ClientInviteAction";
import { InvoiceActions } from "./_components/InvoiceActions";
import { InvoiceRowActions } from "./_components/InvoiceRowActions";
import { describeAnchor } from "@/lib/recurrence";

export default async function ManageClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let client;
  try {
    client = await api.clients.get({ id });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
      >
        ← Volver a clientes
      </Link>

      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="studio-eyebrow">
            Gestión de cliente
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
            {client.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {client.email}
            {client.phone && <> · {client.phone}</>}
            {client.taxId && <> · CUIT {client.taxId}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {client.active ? (
            <span className="inline-flex items-center gap-1.5 rounded-none border border-emerald-200/25 bg-emerald-200/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-100/90">
              <span className="h-1.5 w-1.5 rounded-none bg-emerald-200" /> Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-none border border-white/12 bg-[#161616] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-none bg-foreground/40" /> Pausado
            </span>
          )}
          <ToggleActiveButton id={client.id} active={client.active} />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 reveal" style={{ animationDelay: "60ms" }}>
        <Card>
          <CardContent>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
              Acceso al portal
            </p>
            <ClientInviteAction
              clientId={client.id}
              hasLogin={client.hasLogin}
              pendingInviteUrl={
                client.latestInvite
                  ? buildInviteUrl(client.latestInvite.token)
                  : null
              }
              pendingExpiresAt={client.latestInvite?.expiresAt ?? null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
              Resumen
            </p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Facturas">{client.invoices.length}</Row>
              <Row label="Pagadas">
                {client.invoices.filter((i) => i.status === "PAID").length}
              </Row>
              <Row label="Vencidas">
                {client.invoices.filter((i) => i.status === "OVERDUE").length}
              </Row>
              <Row label="Alta">{formatDate(client.createdAt)}</Row>
            </dl>
          </CardContent>
        </Card>
      </div>

      <section className="reveal" style={{ animationDelay: "120ms" }}>
        <SectionHeader title="Datos del cliente" />
        <Card className="mt-3">
          <CardContent>
            <EditClientForm
              client={{
                id: client.id,
                fullName: client.fullName,
                email: client.email,
                phone: client.phone,
                taxId: client.taxId,
                notes: client.notes,
              }}
            />
          </CardContent>
        </Card>
      </section>

      <section className="reveal" style={{ animationDelay: "180ms" }}>
        <SectionHeader title="Plan recurrente" />
        <Card className="mt-3">
          <CardContent>
            <PlanSection
              clientId={client.id}
              plan={
                client.plan
                  ? {
                      amountUsd: Number(client.plan.amountUsd),
                      description: client.plan.description,
                      frequency: client.plan.frequency,
                      anchorDate: new Date(client.plan.anchorDate).toISOString().slice(0, 10),
                      anchorPretty: describeAnchor(
                        client.plan.frequency,
                        client.plan.anchorDate,
                      ),
                    }
                  : null
              }
            />
          </CardContent>
        </Card>
      </section>

      <section className="reveal" style={{ animationDelay: "240ms" }}>
        <SectionHeader
          title="Facturas"
          action={<InvoiceActions clientId={client.id} hasPlan={!!client.plan} />}
        />
        <Card className="mt-3">
          {client.invoices.length === 0 ? (
            <CardContent>
              <p className="py-3 text-sm text-muted-foreground">Todavía no hay facturas.</p>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
                    <th className="px-5 py-3 text-left font-medium">Descripción</th>
                    <th className="px-5 py-3 text-right font-medium">Monto</th>
                    <th className="px-5 py-3 text-left font-medium">Vence</th>
                    <th className="px-5 py-3 text-left font-medium">Estado</th>
                    <th className="px-5 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {client.invoices.map((i) => (
                    <tr key={i.id} className="transition-colors hover:bg-white/[0.025]">
                      <td className="px-5 py-3.5 text-foreground/95">{i.description}</td>
                      <td className="px-5 py-3.5 text-right font-display tabular-nums text-foreground/95">
                        {formatUsd(i.amountUsd)}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatDate(i.dueDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <InvoiceStatusBadge status={i.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <InvoiceRowActions
                            invoiceId={i.id}
                            status={i.status}
                            pendingPaymentId={i.payments[0]?.id ?? null}
                          />
                          <DeleteInvoiceButton id={i.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <section className="reveal" style={{ animationDelay: "300ms" }}>
        <SectionHeader title="Emails enviados" subtitle={`${client.emailLogs.length} registrados`} />
        <Card className="mt-3">
          {client.emailLogs.length === 0 ? (
            <CardContent>
              <p className="py-3 text-sm text-muted-foreground">
                Sin emails enviados a este cliente.
              </p>
            </CardContent>
          ) : (
            <ul className="divide-y divide-white/6">
              {client.emailLogs.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <div>
                    <p className="text-foreground/95">{e.subject}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="rounded-md border border-white/6 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase">
                        {e.kind.toLowerCase().replace(/_/g, " ")}
                      </span>{" "}
                      → {e.toEmail}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateTime(e.sentAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

function buildInviteUrl(token: string) {
  // Server-side, env is server-only — but APP_URL is server-only safe.
  return `${process.env.APP_URL ?? "http://localhost:3000"}/invite/${token}`;
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
          <p className="studio-eyebrow mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-foreground/95">{children}</dd>
    </div>
  );
}
