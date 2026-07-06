import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Landmark, MessageCircle, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/format";
import { StudioBrand } from "@/components/studio/pixel";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { DecideButtons } from "./_components/DecideButtons";

export const metadata: Metadata = {
  title: "Presupuesto — Surcodia Studio",
  robots: { index: false },
};

const T = {
  es: {
    eyebrow: "PRESUPUESTO",
    for: "Para",
    validUntil: "Válido hasta el",
    expired: "Este presupuesto venció. Escribinos y lo actualizamos.",
    accepted: "Aceptaste este presupuesto. ¡Gracias! Te contactamos para arrancar.",
    rejected: "Rechazaste este presupuesto. Si cambiás de idea, escribinos.",
    total: "Total",
    footer: "¿Dudas? Respondé el mail del presupuesto y te contestamos en el día.",
    nextTitle: "¿Cómo seguimos?",
    nextSub:
      "Podés adelantar el pago por cualquiera de estos medios, o coordinarlo directamente con nosotros.",
    nextSubNoMethods: "Coordinemos el pago y los próximos pasos por mensaje.",
    nextContact: "Coordinar por mensaje",
    holder: "Titular",
  },
  en: {
    eyebrow: "PROPOSAL",
    for: "For",
    validUntil: "Valid until",
    expired: "This proposal expired. Write to us and we'll refresh it.",
    accepted: "You accepted this proposal. Thank you! We'll reach out to get started.",
    rejected: "You declined this proposal. If you change your mind, write to us.",
    total: "Total",
    footer: "Questions? Reply to the proposal email and we'll answer today.",
    nextTitle: "What's next?",
    nextSub:
      "You can get the payment going through any of these methods, or arrange it directly with us.",
    nextSubNoMethods: "Let's arrange payment and next steps by message.",
    nextContact: "Arrange by message",
    holder: "Holder",
  },
} as const;

export default async function QuotePublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await prisma.quote.findUnique({
    where: { token },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote || quote.status === "DRAFT") notFound();

  const locale = quote.locale === "en" ? "en" : "es";
  const s = T[locale];
  const total = quote.items.reduce((acc, i) => acc + Number(i.amountUsd), 0);
  const expired =
    quote.status === "SENT" && quote.validUntil && quote.validUntil.getTime() < Date.now();

  // Aceptado → mostramos los medios de pago configurados (los mismos del
  // portal de clientes) + la vía de contacto para acordar por mensaje.
  const paymentMethods =
    quote.status === "ACCEPTED"
      ? await prisma.paymentMethodConfig.findMany({
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        })
      : [];
  const contactHref = `mailto:hola@surcodia.com?subject=${encodeURIComponent(
    `${locale === "en" ? "Proposal accepted" : "Presupuesto aceptado"} — ${quote.title}`,
  )}`;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="min-w-0 transition-opacity hover:opacity-85">
            <StudioBrand />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
          {s.eyebrow} · {quote.token.slice(-6).toUpperCase()}
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          {quote.title}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {s.for} <span className="text-white/90">{quote.name}</span>
          {quote.company && <span className="text-white/55"> · {quote.company}</span>}
          {quote.validUntil && (
            <>
              {" — "}
              {s.validUntil}{" "}
              {quote.validUntil.toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </>
          )}
        </p>

        {quote.intro && (
          <p className="mt-6 max-w-[58ch] border-l-2 border-[#0070F3] pl-4 text-[15px] leading-relaxed text-white/70">
            {quote.intro}
          </p>
        )}

        {(quote.status === "ACCEPTED" || quote.status === "REJECTED" || expired) && (
          <div
            className="mt-8 border px-5 py-4 text-sm"
            style={{
              borderColor:
                quote.status === "ACCEPTED"
                  ? "rgba(46,160,67,0.5)"
                  : expired
                    ? "rgba(245,166,35,0.4)"
                    : "rgba(229,72,77,0.4)",
              backgroundColor:
                quote.status === "ACCEPTED"
                  ? "rgba(46,160,67,0.08)"
                  : expired
                    ? "rgba(245,166,35,0.06)"
                    : "rgba(229,72,77,0.06)",
            }}
          >
            {quote.status === "ACCEPTED" ? s.accepted : expired ? s.expired : s.rejected}
          </div>
        )}

        <div className="mt-8 border border-white/10 bg-[#0d0d0c]">
          <ul className="divide-y divide-white/6">
            {quote.items.map((it) => (
              <li key={it.id} className="flex items-start justify-between gap-6 px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-white/95">{it.label}</p>
                  {it.detail && (
                    <p className="mt-1 max-w-[48ch] text-[13px] leading-relaxed text-white/50">
                      {it.detail}
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-display tabular-nums text-white/90">
                  {formatUsd(Number(it.amountUsd))}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-white/12 bg-white/[0.03] px-6 py-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/55">
              {s.total}
            </span>
            <span className="font-display text-2xl font-medium tabular-nums">
              {formatUsd(total)}
            </span>
          </div>
        </div>

        {quote.status === "SENT" && !expired && (
          <DecideButtons token={quote.token} locale={locale} />
        )}

        {quote.status === "ACCEPTED" && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
              {s.nextTitle}
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm text-white/55">
              {paymentMethods.length > 0 ? s.nextSub : s.nextSubNoMethods}
            </p>

            {paymentMethods.length > 0 && (
              <div className="mt-5 space-y-3">
                {paymentMethods.map((m) => {
                  const d = m.details as Record<string, string | undefined>;
                  return (
                    <div key={m.id} className="border border-white/12 bg-[#0d0d0c] p-5">
                      <div className="flex items-center gap-2.5">
                        {m.kind === "BANK_ACCOUNT" ? (
                          <Landmark className="h-4 w-4 text-[#0070F3]" />
                        ) : (
                          <Wallet className="h-4 w-4 text-[#17C9A5]" />
                        )}
                        <p className="text-sm font-semibold text-white/95">{m.label}</p>
                      </div>
                      <div className="mt-3 space-y-1 text-[13px] text-white/60">
                        {m.kind === "BANK_ACCOUNT" ? (
                          <>
                            {d.cbu && (
                              <p>
                                <span className="text-white/40">CBU</span>{" "}
                                <span className="font-mono text-white/85">{d.cbu}</span>
                              </p>
                            )}
                            {d.alias && (
                              <p>
                                <span className="text-white/40">Alias</span>{" "}
                                <span className="font-mono text-white/85">{d.alias}</span>
                              </p>
                            )}
                            {d.accountHolder && (
                              <p>
                                <span className="text-white/40">{s.holder}</span>{" "}
                                <span className="text-white/85">{d.accountHolder}</span>
                                {d.taxId && (
                                  <>
                                    {" · "}
                                    <span className="font-mono text-white/70">{d.taxId}</span>
                                  </>
                                )}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>
                              <span className="font-semibold text-white/85">{d.asset}</span>
                              {d.network && (
                                <span className="ml-2 border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55">
                                  {d.network}
                                </span>
                              )}
                            </p>
                            {d.address && (
                              <p className="break-all font-mono text-white/85">{d.address}</p>
                            )}
                          </>
                        )}
                        {m.instructions && (
                          <p className="pt-1 text-[12px] italic text-white/45">{m.instructions}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <a
              href={contactHref}
              className="font-pixel mt-5 inline-flex items-center gap-2.5 border border-white/20 bg-white/[0.05] px-5 py-3 text-[11px] text-white/90 transition hover:border-white/40 hover:bg-white/[0.09]"
            >
              <MessageCircle className="h-4 w-4 text-[#0070F3]" />
              {s.nextContact}
            </a>
          </section>
        )}

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
          {s.footer}
        </p>
      </main>
    </div>
  );
}
