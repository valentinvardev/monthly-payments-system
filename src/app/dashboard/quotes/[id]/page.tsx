import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { formatUsd } from "@/lib/format";
import { getQuoteDocSignedUrl } from "@/lib/supabase/storage";
import { QuoteDocs } from "@/components/QuoteDocs";
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_STYLE } from "../_components/quote-ui";
import { QuoteActions } from "./_components/QuoteActions";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      attachments: { orderBy: { sortOrder: "asc" } },
      client: true,
      lead: true,
    },
  });
  if (!quote) notFound();

  // Mismo visor que ve el destinatario, para revisar antes de enviar que
  // el PDF adjunto es el que va.
  const docs = await Promise.all(
    quote.attachments.map(async (a) => ({
      id: a.id,
      filename: a.filename,
      sizeBytes: a.sizeBytes,
      url: await getQuoteDocSignedUrl(a.path),
    })),
  );

  const total = quote.items.reduce((acc, i) => acc + Number(i.amountUsd), 0);
  const publicUrl = `${env.APP_URL.replace(/\/+$/, "")}/presupuesto/${quote.token}`;

  return (
    <div className="space-y-8">
      <header className="reveal flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="studio-eyebrow">
            <Link href="/dashboard/quotes" className="hover:text-foreground transition">
              Presupuestos
            </Link>{" "}
            / {quote.token.slice(-6).toUpperCase()}
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
            {quote.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Para <span className="text-foreground/90">{quote.name}</span>
            {quote.company && ` · ${quote.company}`} ·{" "}
            <a href={`mailto:${quote.email}`} className="font-mono text-xs hover:text-foreground transition">
              {quote.email}
            </a>
            {quote.client && (
              <>
                {" · "}
                <Link
                  href={`/dashboard/clients/${quote.client.id}`}
                  className="underline decoration-white/25 underline-offset-2 hover:text-foreground"
                >
                  ficha del cliente
                </Link>
              </>
            )}
          </p>
        </div>
        <span
          className={`rounded-none border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${QUOTE_STATUS_STYLE[quote.status]}`}
        >
          {QUOTE_STATUS_LABEL[quote.status]}
        </span>
      </header>

      <Card className="reveal" style={{ animationDelay: "60ms" } as React.CSSProperties}>
        <CardContent>
          {quote.intro && (
            <p className="mb-5 border-l-2 border-white/20 pl-3 text-sm leading-relaxed text-foreground/75">
              {quote.intro}
            </p>
          )}
          <ul className="divide-y divide-white/6">
            {quote.items.map((it) => (
              <li key={it.id} className="flex items-start justify-between gap-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground/95">{it.label}</p>
                  {it.detail && <p className="mt-0.5 text-xs text-muted-foreground">{it.detail}</p>}
                </div>
                <p className="shrink-0 font-display tabular-nums text-foreground/90">
                  {formatUsd(Number(it.amountUsd))}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Total
              {quote.validUntil && (
                <span className="ml-3 normal-case tracking-normal">
                  · válido hasta {new Date(quote.validUntil).toLocaleDateString("es-AR")}
                </span>
              )}
              {quote.decidedAt && (
                <span className="ml-3 normal-case tracking-normal">
                  · decidido el {new Date(quote.decidedAt).toLocaleDateString("es-AR")}
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-medium tabular-nums text-foreground">
              {formatUsd(total)}
            </p>
          </div>
          {quote.rejectReason && (
            <p className="mt-4 rounded-xl border border-rose-300/25 bg-rose-300/[0.06] px-4 py-3 text-sm text-rose-100/90">
              Motivo del rechazo: “{quote.rejectReason}”
            </p>
          )}
        </CardContent>
      </Card>

      {docs.length > 0 && (
        <div className="reveal" style={{ animationDelay: "90ms" } as React.CSSProperties}>
          <QuoteDocs docs={docs} label="Documentos" />
        </div>
      )}

      <QuoteActions
        id={quote.id}
        status={quote.status}
        publicUrl={publicUrl}
        hasClient={Boolean(quote.clientId)}
      />
    </div>
  );
}
