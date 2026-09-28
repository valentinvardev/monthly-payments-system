import type { Metadata } from "next";
import Link from "next/link";
import { caseLang, getLocale } from "@/lib/studio/i18n";
import { getOtherProjects } from "@/lib/studio/content";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { TocNav } from "@/components/studio/TocNav";
import {
  BenefitGrid,
  ClosingCta,
  ModelHeader,
  SiteShot,
  ModelHero,
  NumberedList,
  Prose,
  SectionHead,
} from "@/components/studio/model-page";
import { HALLEY, type HalleyCopy } from "./copy";

// El texto vive en copy.tsx, en español y en inglés. Portugués cae en
// español (ver caseLang).
export async function generateMetadata(): Promise<Metadata> {
  const c = HALLEY[caseLang(await getLocale())];
  return { title: c.meta.title, description: c.meta.description };
}

const Paragraphs = ({ items }: { items: React.ReactNode[] }) => (
  <Prose>
    {items.map((p, i) => (
      <p key={i}>{p}</p>
    ))}
  </Prose>
);

function FactsRow({ facts }: { facts: HalleyCopy["facts"] }) {
  return (
    <section
      className="reveal mt-10 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/10 sm:grid-cols-4"
      style={{ animationDelay: "80ms" }}
    >
      {facts.map((f) => (
        <div key={f.label} className="bg-[#0f0f0f] p-6">
          <p className="font-display text-3xl font-medium tabular-nums text-[#0070F3]">
            {f.value}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/45">{f.label}</p>
        </div>
      ))}
    </section>
  );
}

// Marca el corte entre la mitad de negocio y la mitad técnica, y le avisa
// al lector no técnico que ya puede parar. Decirlo explícitamente vale más
// que dejarlo implícito: el que sigue leyendo, sigue porque quiere.
function PartDivider({ copy }: { copy: HalleyCopy["divider"] }) {
  return (
    <section aria-hidden className="border-t border-white/10 pt-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#0070F3]">
        {copy.eyebrow}
      </p>
      <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-white/55">{copy.body}</p>
    </section>
  );
}

export default async function CasoHalleyPage() {
  const [locale, others] = await Promise.all([getLocale(), getOtherProjects()]);
  const lang = caseLang(locale);
  const c = HALLEY[lang];

  return (
    <div lang={lang} className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />
      <ModelHeader locale={locale} sections={c.sections} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14">
        <ModelHero {...c.hero} />

        <SiteShot
          src="/previews/halley-audiovisual.jpg"
          domain="halleyaudiovisual.com"
          href="https://halleyaudiovisual.com"
          lang={lang}
        />

        <FactsRow facts={c.facts} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          <TocNav sections={c.sections} label={c.toc} />

          <div className="min-w-0 space-y-20">
            {/* ============ MITAD DE NEGOCIO (01-03) ============ */}

            <section id="problema" className="scroll-mt-24">
              <SectionHead n="01" title={c.problem.title} />
              <Paragraphs items={c.problem.body} />
            </section>

            <section id="sistema" className="scroll-mt-24">
              <SectionHead n="02" title={c.system.title} />
              <Paragraphs items={c.system.intro} />
              <BenefitGrid benefits={c.system.items} />
            </section>

            <section id="cierre" className="scroll-mt-24">
              <SectionHead n="03" title={c.fit.title} />
              <Paragraphs items={c.fit.body} />
              <ClosingCta locale={lang} title={c.fit.ctaTitle} body={c.fit.ctaBody} />
            </section>

            {/* ============ MITAD TÉCNICA (04-07) ============ */}

            <PartDivider copy={c.divider} />

            <section id="decisiones" className="scroll-mt-24">
              <SectionHead n="04" title={c.decisions.title} />
              <Paragraphs items={c.decisions.intro} />
              <NumberedList items={c.decisions.items} />
            </section>

            <section id="integracion" className="scroll-mt-24">
              <SectionHead n="05" title={c.integration.title} />
              <Paragraphs items={c.integration.intro} />
              <NumberedList items={c.integration.items} />
              <div className="mt-8 rounded-lg border border-white/12 bg-[#0f0f0f] p-6">
                <p className="max-w-[68ch] text-[13.5px] leading-relaxed text-white/65">
                  {c.integration.note}
                </p>
              </div>
            </section>

            <section id="seguridad" className="scroll-mt-24">
              <SectionHead n="06" title={c.security.title} />
              <Paragraphs items={c.security.body} />
              <BenefitGrid benefits={c.security.items} />
            </section>

            <section id="stack" className="scroll-mt-24">
              <SectionHead n="07" title={c.stack.title} />
              <Paragraphs items={c.stack.body} />
            </section>

            <section className="mt-20 border-t border-white/10 pt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                {c.seeAlso.heading}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {others.length > 0 && (
                  <Link
                    href="/#proyectos"
                    className="group flex items-center justify-between gap-4 rounded-lg border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
                  >
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                        {c.seeAlso.others.title}
                      </span>
                      <span className="mt-1 block text-[13px] text-white/50">
                        {c.seeAlso.others.hint}
                      </span>
                    </span>
                  </Link>
                )}
                <Link
                  href="/casos/stealth-seller"
                  className="group flex items-center justify-between gap-4 rounded-lg border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                      {c.seeAlso.sibling.title}
                    </span>
                    <span className="mt-1 block text-[13px] text-white/50">
                      {c.seeAlso.sibling.hint}
                    </span>
                  </span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
