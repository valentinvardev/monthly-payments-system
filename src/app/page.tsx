import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, t } from "@/lib/studio/i18n";
import {
  NICHE_ART,
  PIXEL_V,
  getAllProjects,
  getStudioNiches,
} from "@/lib/studio/content";
import { CruxMark, PixelWord, StudioBrand } from "@/components/studio/pixel";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { Marquee } from "@/components/studio/Marquee";
import { LangToggle } from "@/components/studio/LangToggle";
import { StudioMobileMenu } from "@/components/studio/StudioMobileMenu";
import { TechBadges } from "@/components/studio/TechBadges";
import { BelgranoSlider } from "@/components/studio/BelgranoSlider";
import { ProjectItem, ProjectMiniLogos } from "@/components/studio/ProjectItem";

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
    getAllProjects(),
  ]);
  const s = t(locale);

  // Proyectos agrupados por nicho, para los mini-logos de cada tarjeta.
  const projectsOfNiche = (nicheId: number) =>
    projects.filter((p) => p.nicheId === nicheId);

  // Fotos vendidas de Belgrano: se agregan soltando foto-1.jpg / foto-2.jpg /
  // foto-3.jpg en public/belgrano/ — el slider muestra las que existan.
  const belgranoPhotos = [1, 2, 3]
    .map((n) => `/belgrano/foto-${n}.jpg`)
    .filter((p) => existsSync(path.join(process.cwd(), "public", p)));

  // Capturas de proyectos (scripts las generan a public/previews/<slug>.jpg).
  const previewOf = (slug: string) => {
    const p = `/previews/${slug}.jpg`;
    return existsSync(path.join(process.cwd(), "public", p)) ? p : null;
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      {/* ================= NAV ================= */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a] md:bg-[#0a0a0a]/85 md:backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="min-w-0 transition-opacity hover:opacity-85">
            <StudioBrand />
          </Link>
          {/* Desktop nav (sm+) */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
            <a href="#nichos" className="font-pixel px-3 py-1.5 text-[10px] text-white/55 transition hover:text-white">
              {s.navNiches}
            </a>
            <a href="#proyectos" className="font-pixel px-3 py-1.5 text-[10px] text-white/55 transition hover:text-white">
              {s.navProjects}
            </a>
            <a
              href="#modelos"
              className="font-pixel px-3 py-1.5 text-[10px] text-white/55 transition hover:text-white"
            >
              Modelos
            </a>
            <a href="#contacto" className="font-pixel px-3 py-1.5 text-[10px] text-white/55 transition hover:text-white">
              {s.navContact}
            </a>
            <LangToggle locale={locale} />
            <Link
              href="/contanos"
              className="ml-1 inline-flex h-8 items-center justify-center gap-1.5 bg-[#0070F3] px-3.5 font-pixel text-[10px] text-white transition hover:bg-[#0060d3]"
            >
              {s.heroCtaA}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>

          {/* Mobile: hamburguesa + sidebar */}
          <StudioMobileMenu
            items={[
              { href: "#nichos", label: s.navNiches },
              { href: "#proyectos", label: s.navProjects },
              { href: "#modelos", label: "Modelos" },
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
                className="inline-flex h-11 items-center justify-center gap-2 bg-[#0070F3] px-5 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
              >
                {s.heroCtaA}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#proyectos"
                className="inline-flex h-11 items-center justify-center border border-white/12 bg-[#161616] px-5 font-pixel text-[11px] text-white/90 transition hover:bg-[#1f1f1f]"
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
              src={`/pixel/dev-sur.png${PIXEL_V}`}
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
              const name = locale === "en" && n.nameEn ? n.nameEn : n.name;
              const tagline = locale === "en" && n.taglineEn ? n.taglineEn : n.tagline;
              return (
                <article
                  key={n.slug}
                  className="group flex flex-col overflow-hidden rounded-lg border border-white/12 bg-[#0f0f0f] transition-colors hover:border-white/25"
                >
                  {art && (
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[#0a0a0a]">
                      <Image
                        src={art.banner}
                        alt=""
                        fill
                        unoptimized
                        className="pixelated object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">{name}</h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/55">{tagline}</p>
                    <div className="mt-4">
                      <ProjectMiniLogos projects={projectsOfNiche(n.id)} />
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <a
                        href="#proyectos"
                        className="inline-flex h-9 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
                      >
                        {s.nichesCta}
                        <ArrowRight className="h-3.5 w-3.5 text-white/50" />
                      </a>
                      {art && (
                        <Image
                          src={art.character}
                          alt=""
                          width={64}
                          height={64}
                          unoptimized
                          className="pixelated -mb-1 opacity-85 transition-transform duration-300 group-hover:-translate-y-1"
                        />
                      )}
                    </div>
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
            <BelgranoSlider
              photos={belgranoPhotos}
              placeholder={s.belgranoPlaceholder}
              badge={s.belgranoBadge}
            />
          </div>
        </section>

        <div className="studio-dissolve" aria-hidden />

        {/* ================= MODELOS DE NEGOCIO ================= */}
        <section id="modelos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            SOLUCIONES POR MODELO DE NEGOCIO
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em]">
            ¿Cómo funciona tu negocio?
          </h2>
          <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-white/60">
            Análisis completos de cada modelo: qué incluye el sistema, qué beneficios trae y los
            datos que respaldan cada decisión de diseño.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                href: "/modelo-ecommerce",
                img: "/pixel/hibrido-tienda.png",
                title: "E-commerce",
                body: "Vendés productos y querés tu propia tienda: catálogo, checkout sin fricción, envíos y panel. Sin comisión por venta.",
              },
              {
                href: "/modelo-cursos",
                img: "/pixel/hibrido-curso.png",
                title: "Academia digital",
                body: "Enseñás online: cursos con estructura, progreso, comunidad y suscripción. Tu marca y tus alumnos, no los de la plataforma.",
              },
              {
                href: "/modelo-hibrido",
                img: "/pixel/hibrido-membresia.png",
                title: "Modelo híbrido",
                body: "Vendés, enseñás y tenés comunidad. Tienda, cursos, membresía y agenda conviviendo en un mismo sistema.",
              },
            ].map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group flex flex-col rounded-lg border border-white/12 bg-[#0f0f0f] p-6 transition-colors hover:border-white/25"
              >
                <Image
                  src={m.img}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="pixelated"
                />
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">{m.title}</h3>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-white/55">
                  {m.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-pixel text-[10px] text-white/70 transition group-hover:text-white">
                  Ver el análisis
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= PROYECTOS ================= */}
        <section id="proyectos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            {s.projectsEyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em]">
            {s.projectsTitle}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectItem
                key={p.slug}
                p={p}
                preview={previewOf(p.slug)}
                locale={locale}
                s={s}
              />
            ))}
          </div>
        </section>

        <Marquee items={MARQUEE_ITEMS.slice().reverse()} />

        {/* ================= MANIFIESTO ================= */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex justify-center lg:justify-start">
            <Image
              src={`/pixel/terminal.png${PIXEL_V}`}
              alt="Una terminal retro trabajando sola, con el cursor encendido"
              width={320}
              height={320}
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

        {/* ================= QUIÉN ESTÁ DETRÁS ================= */}
        <section className="border-t border-white/8">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
              {s.aboutEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.025em]">
              {s.aboutTitle}
            </h2>
            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
              {/* Capa transparente encima: bloquea drag / click-derecho
                  directo sobre la foto (no es DRM, pero evita el copiado
                  casual). La imagen queda pointer-events-none debajo. */}
              <div className="relative h-24 w-24 shrink-0 select-none">
                <Image
                  src="/valentin.jpg"
                  alt="Valentín Varela, fundador de Surcodia"
                  fill
                  unoptimized
                  draggable={false}
                  className="pointer-events-none select-none rounded-full border border-white/12 object-cover"
                />
                <span aria-hidden className="absolute inset-0 z-10 rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="max-w-[58ch] text-[15px] leading-relaxed text-white/60">
                  {s.aboutP1}
                </p>
                <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-white/60">
                  {s.aboutP2}
                </p>
                <a
                  href="https://valentinvarela.cloud/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
                >
                  {s.aboutCta}
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/50" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTACTO ================= */}
        <section id="contacto" className="relative scroll-mt-20 border-t border-white/8">
          <div className="absolute inset-0 opacity-60">
            <Image
              src={`/pixel/hero-cielo.png${PIXEL_V}`}
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
                className="inline-flex h-12 items-center justify-center gap-2 bg-[#0070F3] px-6 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
              >
                {s.heroCtaA}
                <ArrowRight className="h-4 w-4" />
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
