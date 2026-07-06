import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, t } from "@/lib/studio/i18n";
import {
  ACCENT_HEX,
  NICHE_ART,
  getFeaturedProjects,
  getStudioNiches,
} from "@/lib/studio/content";
import { CruxMark, PixelWord, SMonogram } from "@/components/studio/pixel";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { Marquee } from "@/components/studio/Marquee";
import { LangToggle } from "@/components/studio/LangToggle";
import { StudioMobileMenu } from "@/components/studio/StudioMobileMenu";
import { TechBadges } from "@/components/studio/TechBadges";
import { BelgranoSlider } from "@/components/studio/BelgranoSlider";

export const metadata: Metadata = {
  title: "Surcodia Studio — Software del sur",
  description:
    "Estudio de desarrollo de software, e-commerce y soluciones con IA. Código preciso, diseño con criterio — desde Sudamérica.",
};

const MARQUEE_ITEMS = [
  "Agentes IA",
  "E-commerce",
  "Fotografía",
  "Automatización",
  "Next.js",
  "Diseño",
  "MercadoPago",
  "Software a medida",
  "tRPC",
  "Supabase",
  "Checkout",
  "Reconocimiento facial",
];

export default async function StudioLanding() {
  const [user, locale, niches, projects] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getStudioNiches(),
    getFeaturedProjects(),
  ]);
  const s = t(locale);

  // Fotos vendidas de Belgrano: se agregan soltando foto-1.jpg / foto-2.jpg /
  // foto-3.jpg en public/belgrano/ — el slider muestra las que existan.
  const belgranoPhotos = [1, 2, 3]
    .map((n) => `/belgrano/foto-${n}.jpg`)
    .filter((p) => existsSync(path.join(process.cwd(), "public", p)));

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      {/* ================= NAV ================= */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <SMonogram size={22} color="#fafafa" className="transition-transform group-hover:scale-110" />
            <span className="text-[15px] font-semibold tracking-[-0.03em]">surcodia</span>
            <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.4em] text-white/45">
              studio
            </span>
          </Link>
          {/* Desktop nav (sm+) */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
            <a href="#nichos" className="px-3 py-1.5 text-xs text-white/55 transition hover:text-white">
              {s.navNiches}
            </a>
            <a href="#proyectos" className="px-3 py-1.5 text-xs text-white/55 transition hover:text-white">
              {s.navProjects}
            </a>
            <a href="#contacto" className="px-3 py-1.5 text-xs text-white/55 transition hover:text-white">
              {s.navContact}
            </a>
            <LangToggle locale={locale} />
            <Link
              href={user ? "/ingreso" : "/login"}
              className="ml-1 border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/90 transition hover:border-white/35 hover:bg-white/[0.09]"
            >
              {user ? s.navPanel : s.navClients}
            </Link>
          </nav>

          {/* Mobile: hamburguesa + sidebar */}
          <StudioMobileMenu
            items={[
              { href: "#nichos", label: s.navNiches },
              { href: "#proyectos", label: s.navProjects },
              { href: "#contacto", label: s.navContact },
            ]}
            locale={locale}
            loginHref={user ? "/ingreso" : "/login"}
            loginLabel={user ? s.navPanel : s.navClients}
          />
        </div>
      </header>

      <main className="relative z-10">
        {/* ================= HERO ================= */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="reveal">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              {s.heroEyebrow}
            </p>
            <h1 className="mt-5 max-w-[24ch] font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] sm:text-5xl">
              {s.heroTitleA}{" "}
              <span className="font-light text-white/55">{s.heroTitleB}</span>
            </h1>
            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-white/60">
              {s.heroSub}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/contanos"
                className="border border-[#0070F3] bg-[#0070F3] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0060d3]"
              >
                {s.heroCtaA}
              </Link>
              <a
                href="#proyectos"
                className="border border-white/18 px-5 py-2.5 text-sm text-white/85 transition hover:border-white/40 hover:text-white"
              >
                {s.heroCtaB}
              </a>
            </div>
          </div>
          <div className="reveal relative hidden lg:flex items-center justify-center" style={{ animationDelay: "150ms" }}>
            <div className="absolute -top-8 right-2 opacity-90">
              <CruxMark size={56} color="#fafafa" />
            </div>
            <Image
              src="/pixel/dev-sur.png"
              alt="El Dev del Sur — mascota pixel de Surcodia tomando mate con su laptop"
              width={340}
              height={340}
              unoptimized
              priority
              className="pixelated float-soft"
            />
          </div>
        </section>

        <Marquee items={MARQUEE_ITEMS} />

        {/* ================= NICHOS ================= */}
        <section id="nichos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            {s.nichesEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em]">
            {s.nichesTitle}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {niches.map((n) => {
              const art = NICHE_ART[n.slug];
              const accent = ACCENT_HEX[n.color] ?? ACCENT_HEX.blue;
              const name = locale === "en" && n.nameEn ? n.nameEn : n.name;
              const tagline = locale === "en" && n.taglineEn ? n.taglineEn : n.tagline;
              return (
                <article
                  key={n.slug}
                  className="group relative border border-white/10 bg-[#0a0a0a] transition-colors duration-300"
                  style={{ ["--acc" as string]: accent }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ boxShadow: `inset 0 0 0 1px ${accent}` }}
                  />
                  {art && (
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10">
                      <Image
                        src={art.banner}
                        alt=""
                        fill
                        unoptimized
                        className="pixelated object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="relative p-6">
                    <span
                      className="absolute right-6 top-6 inline-block h-2 w-2"
                      style={{ backgroundColor: accent }}
                    />
                    <h3 className="pr-8 text-lg font-semibold tracking-[-0.02em]">{name}</h3>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-white/55">{tagline}</p>
                    {art && (
                      <div className="mt-5 flex justify-end">
                        <Image
                          src={art.character}
                          alt=""
                          width={72}
                          height={72}
                          unoptimized
                          className="pixelated opacity-85 transition-transform duration-300 group-hover:-translate-y-1"
                        />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============ FRANJA BELGRANO (caso real, fotografía) ============ */}
        <section className="border-y border-white/10 bg-[#6CACE4] text-[#0a0a0a]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <Image
                src="/belgrano/escudo.png"
                alt="Escudo del Club Atlético Belgrano de Córdoba"
                width={96}
                height={96}
                unoptimized
                className="shrink-0"
              />
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0a0a0a]/60">
                  {s.belgranoTag}
                </p>
                <h3 className="mt-2 max-w-[28ch] font-display text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">
                  {s.belgranoTitle}
                </h3>
                <p className="mt-2 max-w-[52ch] text-sm font-medium text-[#0a0a0a]/70">
                  {s.belgranoSub}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[#0a0a0a]/60">
                  {s.belgranoPhotosBy}{" "}
                  <a
                    href="https://ivanamaritano.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0a0a0a]/85 underline decoration-[#0a0a0a]/35 underline-offset-2 transition hover:text-[#0a0a0a]"
                  >
                    Ivana Maritano — ivanamaritano.com
                  </a>
                </p>
              </div>
            </div>
            <BelgranoSlider photos={belgranoPhotos} placeholder={s.belgranoPlaceholder} />
          </div>
        </section>

        <div className="studio-dissolve" aria-hidden />

        {/* ================= PROYECTOS ================= */}
        <section id="proyectos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            {s.projectsEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em]">
            {s.projectsTitle}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {projects.map((p) => {
              const accent = ACCENT_HEX[p.color] ?? ACCENT_HEX.blue;
              const short = locale === "en" && p.shortEn ? p.shortEn : p.short;
              return (
                <article
                  key={p.slug}
                  className="group flex flex-col border border-white/10 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-[-0.02em]">{p.name}</h3>
                    <span className="mt-1.5 inline-block h-2 w-2 shrink-0" style={{ backgroundColor: accent }} />
                  </div>
                  <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-white/55">{short}</p>
                  {p.stack.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {p.stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="border border-white/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/45"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center gap-2 border border-white/20 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
                      style={{ borderColor: `${accent}66` }}
                    >
                      {s.projectsVisit}
                      <span aria-hidden style={{ color: accent }}>→</span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <Marquee items={MARQUEE_ITEMS.slice().reverse()} accent="#7928CA" />

        {/* ================= MANIFIESTO ================= */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/pixel/hornero.png"
              alt="El Hornero — el pájaro constructor, mascota pixel de Surcodia"
              width={230}
              height={230}
              unoptimized
              className="pixelated"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              {s.manifestoEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em]">
              {s.manifestoTitle}
            </h2>
            <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-white/60">
              {s.manifestoBody}
            </p>
            <p className="mt-6 border-l-2 border-[#0070F3] pl-4 font-display text-lg font-light italic text-white/80">
              {s.manifestoQuote}
            </p>
            <div className="mt-10">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                {s.stackEyebrow}
              </p>
              <TechBadges />
            </div>
          </div>
        </section>

        {/* ================= CONTACTO ================= */}
        <section id="contacto" className="relative scroll-mt-20 border-t border-white/8">
          <div className="absolute inset-0 opacity-60">
            <Image
              src="/pixel/hero-cielo.png"
              alt=""
              fill
              unoptimized
              className="pixelated object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-6xl px-5 py-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              {s.contactEyebrow}
            </p>
            <h2 className="mt-3 max-w-[20ch] font-display text-3xl font-medium tracking-[-0.025em] sm:text-4xl">
              {s.contactTitle}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[15px] text-white/60">{s.contactSub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contanos"
                className="inline-block border border-[#0070F3] bg-[#0070F3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0060d3]"
              >
                {s.heroCtaA}
              </Link>
              <a
                href="mailto:hola@surcodia.com"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55 transition hover:text-white"
              >
                hola@surcodia.com
              </a>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-white/8">
          <div className="mx-auto max-w-6xl px-5 pb-10 pt-14">
            <PixelWord
              word="SURCODIA"
              color="#fafafa"
              specials={[{ letter: 4, x: 2, y: 2, color: "#0070F3" }]}
              className="w-full h-auto"
            />
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                <CruxMark size={16} color="#8a8a86" />
                © {new Date().getFullYear()} Surcodia · {s.footerRights}
              </div>
              <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.2em]">
                <Link href="/login" className="text-white/45 transition hover:text-white">
                  {s.footerLogin}
                </Link>
                <a
                  href="https://github.com/valentinvardev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/45 transition hover:text-white"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
