import { prisma } from "@/lib/prisma";
import { QuoteForm } from "./_components/QuoteForm";

// Alta de presupuesto. Con ?lead=<id> viene precargado desde un lead
// del formulario /contanos; el select de clientes permite autocompletar
// destinatarios existentes.
export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead: leadId } = await searchParams;

  const [clients, lead] = await Promise.all([
    prisma.client.findMany({
      where: { active: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true },
    }),
    leadId
      ? prisma.projectLead.findUnique({
          where: { id: leadId },
          select: { id: true, name: true, email: true, company: true, problem: true, locale: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="studio-eyebrow">
          Presupuestos
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Nuevo <span className="font-light text-foreground/70">presupuesto</span>.
        </h1>
        {lead && (
          <p className="mt-2 text-sm text-muted-foreground">
            Precargado desde el lead de <span className="text-foreground/90">{lead.name}</span>
          </p>
        )}
      </header>

      <QuoteForm
        clients={clients}
        initial={
          lead
            ? {
                leadId: lead.id,
                name: lead.name,
                email: lead.email,
                company: lead.company ?? "",
                locale: lead.locale === "en" ? "en" : "es",
              }
            : null
        }
      />
    </div>
  );
}
