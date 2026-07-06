import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/format";
import { SMonogram } from "@/components/studio/pixel";
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

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <SMonogram size={22} color="#fafafa" />
            <span className="text-[15px] font-semibold tracking-[-0.03em]">surcodia</span>
            <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.4em] text-white/45">
              studio
            </span>
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

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
          {s.footer}
        </p>
      </main>
    </div>
  );
}
