import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseLang, getLocale } from "@/lib/studio/i18n";
import { getOtherProjects } from "@/lib/studio/content";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { TocNav } from "@/components/studio/TocNav";
import {
  BenefitGrid,
  ClosingCta,
  ModelHeader,
  ModelHero,
  Prose,
  SectionHead,
  SiteShot,
} from "@/components/studio/model-page";
import { STEALTH } from "./copy";

// El texto vive en copy.tsx, en español y en inglés. Portugués cae en
// español (ver caseLang).
export async function generateMetadata(): Promise<Metadata> {
  const c = STEALTH[caseLang(await getLocale())];
  return { title: c.meta.title, description: c.meta.description };
}

const Paragraphs = ({ items }: { items: React.ReactNode[] }) => (
  <Prose>
    {items.map((p, i) => (
      <p key={i}>{p}</p>
    ))}
  </Prose>
);

export default async function CasoStealthSellerPage() {
  const [locale, others] = await Promise.all([getLocale(), getOtherProjects()]);
  const lang = caseLang(locale);
  const c = STEALTH[lang];

  return (
    <div lang={lang} className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />
      <ModelHeader locale={locale} sections={c.sections} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14">
        <div className="reveal mb-8">
          <Image
            src="/logos/stealth-seller.svg"
            alt="Stealth Seller"
            width={222}
            height={30}
            unoptimized
            className="h-7 w-auto"
          />
        </div>

        <ModelHero {...c.hero} />

        <a
          href="https://stealthseller.co"
          target="_blank"
          rel="noopener noreferrer"
          className="reveal mt-7 inline-flex h-10 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
          style={{ animationDelay: "60ms" }}
        >
          {c.visit}
          <ArrowUpRight className="h-3.5 w-3.5 text-white/50" aria-hidden />
        </a>

        <SiteShot src="/previews/stealth-seller.jpg" domain="stealthseller.co" lang={lang} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          <TocNav sections={c.sections} label={c.toc} />

          <div className="min-w-0 space-y-20">
            <section id="mercado" className="scroll-mt-24">
              <SectionHead n="01" title={c.market.title} />
              <Paragraphs items={c.market.body} />
            </section>

            <section id="producto" className="scroll-mt-24">
              <SectionHead n="02" title={c.product.title} />
              <Paragraphs items={c.product.intro} />
              <BenefitGrid benefits={c.product.items} />
            </section>

            <section id="trabajo" className="scroll-mt-24">
              <SectionHead n="03" title={c.work.title} />
              <Paragraphs items={c.work.body} />
              <BenefitGrid benefits={c.work.items} />
            </section>

            <section id="tu-empresa" className="scroll-mt-24">
              <SectionHead n="04" title={c.yours.title} />
              <Paragraphs items={c.yours.body} />
              <ClosingCta locale={lang} title={c.yours.ctaTitle} body={c.yours.ctaBody} />
            </section>

            <section className="border-t border-white/10 pt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                {c.seeAlso.heading}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/casos/halley"
                  className="group flex items-center justify-between gap-4 border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
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
                {others.length > 0 && (
                  <Link
                    href="/#proyectos"
                    className="group flex items-center justify-between gap-4 border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
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
              </div>
              <p className="mt-10 max-w-[68ch] text-[12px] leading-relaxed text-white/55">
                {c.disclaimer}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
