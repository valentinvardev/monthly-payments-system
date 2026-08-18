import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuoteForm } from "../../_components/QuoteForm";

// Edición de un borrador. Reusa el mismo formulario del alta: si los
// dos divergen, el que se usa menos queda desactualizado sin que nadie
// se entere.
export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quote, clients] = await Promise.all([
    prisma.quote.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.client.findMany({
      where: { active: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true },
    }),
  ]);

  if (!quote) notFound();

  // Un presupuesto enviado ya lo vio el destinatario; el router también
  // lo rechaza, pero acá evitamos mostrar un formulario que no va a
  // poder guardar.
  if (quote.status !== "DRAFT") redirect(`/dashboard/quotes/${id}`);

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="studio-eyebrow">
          <Link href={`/dashboard/quotes/${id}`} className="transition hover:text-foreground">
            Presupuestos
          </Link>{" "}
          / {quote.token.slice(-6).toUpperCase()}
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Editar <span className="font-light text-foreground/70">borrador</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no se envió, así que podés cambiar lo que haga falta.
        </p>
      </header>

      <QuoteForm
        clients={clients}
        initial={null}
        quote={{
          id: quote.id,
          clientId: quote.clientId,
          name: quote.name,
          email: quote.email,
          company: quote.company,
          title: quote.title,
          intro: quote.intro,
          locale: quote.locale,
          validUntil: quote.validUntil
            ? new Date(quote.validUntil).toISOString().slice(0, 10)
            : null,
          items: quote.items.map((it) => ({
            label: it.label,
            detail: it.detail,
            amountUsd: Number(it.amountUsd),
          })),
        }}
      />
    </div>
  );
}
