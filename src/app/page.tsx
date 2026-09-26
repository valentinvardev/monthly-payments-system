import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, t, type Locale } from "@/lib/studio/i18n";
import { PIXEL_V, getOtherProjects } from "@/lib/studio/content";
import { CruxMark, PixelWord, StudioBrand } from "@/components/studio/pixel";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { Marquee } from "@/components/studio/Marquee";
import { LangToggle } from "@/components/studio/LangToggle";
import { StudioMobileMenu } from "@/components/studio/StudioMobileMenu";
import { ProjectItem } from "@/components/studio/ProjectItem";
import { StealthSellerBadge } from "@/components/studio/StealthSellerBadge";

export const metadata: Metadata = {
  title: { absolute: "Valentín Varela · SurCodia" },
  description:
    "SurCodia es cómo Valentín Varela entra a tu operación, encuentra dónde se pierde tiempo o plata, y construye la solución. Empieza con un diagnóstico corto: una reunión y tres mejoras con impacto.",
};

// Las áreas donde se suele perder tiempo o plata. La tira nombra procesos,
// no tecnologías: es lo que el dueño reconoce de su propia empresa.
const MARQUEE: Record<Locale, string[]> = {
  es: [
    "Cobranzas",
    "Presupuestos",
    "Carga de pedidos",
    "Atención al cliente",
    "Stock",
    "Facturación",
    "Reportes",
    "Conciliación de pagos",
    "Agentes de IA",
    "Integraciones",
    "Cuellos de botella",
    "Trazabilidad",
  ],
  en: [
    "Collections",
    "Quotes",
    "Order entry",
    "Customer service",
    "Inventory",
    "Invoicing",
    "Reporting",
    "Payment matching",
    "AI agents",
    "Integrations",
    "Bottlenecks",
    "Traceability",
  ],
  pt: [
    "Cobrança",
    "Orçamentos",
    "Entrada de pedidos",
    "Atendimento",
    "Estoque",
    "Faturamento",
    "Relatórios",
    "Conciliação",
    "Agentes de IA",
    "Integrações",
    "Gargalos",
    "Rastreabilidade",
  ],
};

const eyebrow = "font-mono text-[10px] uppercase tracking-[0.3em] text-white/45";
const h2 = "mt-3 font-display text-3xl font-medium tracking-[-0.025em] text-balance";

export default async function StudioLanding() {
  const [user, locale, projects] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getOtherProjects(),
  ]);
  const s = t(locale);

  // Capturas de proyectos (scripts las generan a public/previews/<slug>.jpg).
  const previewOf = (slug: string) => {
    const p = `/previews/${slug}.jpg`;
    return existsSync(path.join(process.cwd(), "public", p)) ? p : null;
  };

  const nav = [
    { href: "#servicio", label: s.navService },
    { href: "#metodo", label: s.navMethod },
    { href: "#casos", label: s.navCases },
    { href: "#contacto", label: s.navContact },
  ];

  const diagnosis = [
    { area: s.diag1Area, finding: s.diag1Finding, impact: s.diag1Impact },
    { area: s.diag2Area, finding: s.diag2Finding, impact: s.diag2Impact },
    { area: s.diag3Area, finding: s.diag3Finding, impact: s.diag3Impact },
  ];

  const outcomes = [
    { title: s.outcome1Title, body: s.outcome1Body },
    { title: s.outcome2Title, body: s.outcome2Body },
    { title: s.outcome3Title, body: s.outcome3Body },
    { title: s.outcome4Title, body: s.outcome4Body },
  ];

  const steps = [
    { title: s.step1Title, body: s.step1Body },
    { title: s.step2Title, body: s.step2Body },
    { title: s.step3Title, body: s.step3Body },
    { title: s.step4Title, body: s.step4Body },
  ];

  const cases = [
    {
      href: "/casos/halley",
      shot: "/previews/halley-audiovisual.jpg",
      tag: s.caseHalleyTag,
      title: s.caseHalleyTitle,
      body: s.caseHalleyBody,
      facts: [
        { value: "27", label: s.caseHalleyF1 },
        { value: s.caseHalleyV2, label: s.caseHalleyF2 },
        { value: "2", label: s.caseHalleyF3 },
      ],
    },
    {
      href: "/casos/stealth-seller",
      shot: "/previews/stealth-seller.jpg",
      tag: s.caseSsTag,
      title: s.caseSsTitle,
      body: s.caseSsBody,
      facts: [
        { value: "600", label: s.caseSsF1 },
        { value: s.caseSsV2, label: s.caseSsF2 },
        { value: s.caseSsV3, label: s.caseSsF3 },
      ],
    },
  ];

  return (
    <div lang={locale} className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      {/* ================= NAV ================= */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a] md:bg-[#0a0a0a]/85 md:backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="min-w-0 transition-opacity hover:opacity-85">
            <StudioBrand />
          </Link>
          {/* Entre sm y lg las secciones no entran al lado de la marca: quedan
              el idioma y el pedido de diagnóstico, y las secciones pasan al
              menú lateral, que en esta página se muestra hasta lg. */}
          <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="font-pixel hidden whitespace-nowrap px-3 py-1.5 text-[10px] text-white/55 transition hover:text-white lg:inline"
              >
                {n.label}
              </a>
            ))}
            <LangToggle locale={locale} />
            <Link
              href="/contanos"
              className="ml-1 inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap bg-[#0070F3] px-3.5 font-pixel text-[10px] text-white transition hover:bg-[#0060d3]"
            >
              {s.heroCta}
            </Link>
          </nav>

          <StudioMobileMenu
            items={nav}
            locale={locale}
            loginHref={user ? "/ingreso" : "/login"}
            loginLabel={user ? s.navPanel : s.navClients}
            buttonClassName="lg:hidden"
          />
        </div>
      </header>

      <main className="relative z-10">
        {/* ================= HERO =================
            Valentín primero, SurCodia como el vehículo. A la derecha, lo
            que se compra: un diagnóstico, con la forma que tiene cuando se
            entrega. */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal">
            {/* En teléfonos el badge baja a su propia fila: al lado de la foto
                no entra y se parte en dos renglones. */}
            <div className="grid grid-cols-[48px_1fr] items-center gap-x-3.5 gap-y-3 sm:gap-y-1.5">
              <div className="relative h-12 w-12 select-none sm:row-span-2">
                <Image
                  src="/valentin.jpg"
                  alt=""
                  fill
                  unoptimized
                  draggable={false}
                  className="pointer-events-none select-none rounded-full border border-white/12 object-cover"
                />
              </div>
              <p className="min-w-0 text-[15px] font-medium tracking-[-0.01em] text-white/90 sm:self-end">
                Valentín Varela
              </p>
              <div className="col-span-2 sm:col-span-1 sm:col-start-2 sm:self-start">
                <StealthSellerBadge label={s.heroRole} />
              </div>
            </div>

            <h1 className="mt-9 max-w-[22ch] font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-balance sm:text-[3.25rem]">
              {s.heroTitle}
            </h1>
            <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed text-white/60">{s.heroSub}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/contanos"
                className="inline-flex h-11 items-center justify-center gap-2 bg-[#0070F3] px-5 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
              >
                {s.heroCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#casos"
                className="inline-flex h-11 items-center justify-center border border-white/12 bg-[#161616] px-5 font-pixel text-[11px] text-white/90 transition hover:bg-[#1f1f1f]"
              >
                {s.heroCtaB}
              </a>
            </div>
            <p className="mt-5 max-w-[54ch] text-[13px] text-white/45">{s.heroOffer}</p>
          </div>

          <figure
            className="reveal border border-white/12 bg-[#0f0f0f]"
            style={{ animationDelay: "150ms" }}
            aria-label={s.diagTitle}
          >
            <figcaption className="flex items-baseline justify-between gap-4 border-b border-white/10 px-5 py-4">
              <span className="text-[13px] font-medium text-white/85">{s.diagTitle}</span>
              <span className="text-right text-[12px] text-white/50">{s.diagCompany}</span>
            </figcaption>
            <ol>
              {diagnosis.map((d, i) => (
                <li
                  key={d.area}
                  className="grid grid-cols-[auto_1fr_auto] gap-x-4 border-b border-white/8 px-5 py-4 last:border-b-0"
                >
                  <span className="font-mono text-[11px] tabular-nums text-white/35">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-white/90">{d.area}</span>
                    <span className="mt-1 block text-[13px] leading-snug text-white/50">{d.finding}</span>
                  </span>
                  <span className="self-center whitespace-nowrap font-display text-[15px] font-medium tabular-nums text-[#3291FF]">
                    {d.impact}
                  </span>
                </li>
              ))}
            </ol>
            <p className="border-t border-white/10 px-5 py-3 text-[12px] text-white/55">{s.diagNote}</p>
          </figure>
        </section>

        <Marquee items={MARQUEE[locale]} />

        {/* ================= QUÉ CAMBIA ================= */}
        <section id="servicio" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className={eyebrow}>{s.serviceEyebrow}</p>
          <h2 className={h2}>{s.serviceTitle}</h2>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/60">{s.serviceIntro}</p>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {outcomes.map((o) => (
              <div key={o.title} className="border-t border-white/15 pt-5">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-white/95">{o.title}</h3>
                <p className="mt-2.5 max-w-[48ch] text-[14px] leading-relaxed text-white/55">{o.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CÓMO TRABAJO =================
            Es una secuencia de verdad, por eso va numerada. El primer paso es
            la oferta de entrada y se marca como tal. */}
        <section id="metodo" className="scroll-mt-20 border-y border-white/8 bg-[#0d0d0d]">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className={eyebrow}>{s.methodEyebrow}</p>
            <h2 className={h2}>{s.methodTitle}</h2>
            <ol className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
              {steps.map((st, i) => (
                <li key={st.title} className={`flex flex-col p-6 ${i === 0 ? "bg-[#0f1726]" : "bg-[#0f0f0f]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tabular-nums text-white/40">{i + 1}</span>
                    {i === 0 && (
                      <span className="bg-[#0070F3] px-2 py-0.5 font-pixel text-[9px] text-white">
                        {s.methodStart}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.02em] text-white/95">{st.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/55">{st.body}</p>
                </li>
              ))}
            </ol>
            <Link
              href="/contanos"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 bg-[#0070F3] px-5 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
            >
              {s.methodCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* ================= CASOS ================= */}
        <section id="casos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <p className={eyebrow}>{s.casesEyebrow}</p>
          <h2 className={h2}>{s.casesTitle}</h2>
          <div className="mt-10 grid gap-5">
            {cases.map((c, i) => (
              <Link
                key={c.href}
                href={c.href}
                aria-labelledby={`case-${i}`}
                className="group grid gap-8 border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white/50">{c.tag}</p>
                  <h3
                    id={`case-${i}`}
                    className="mt-2 max-w-[26ch] font-display text-2xl font-medium leading-tight tracking-[-0.025em] text-balance sm:text-3xl"
                  >
                    {c.title}
                  </h3>
                  <p className="mt-3 max-w-[56ch] text-[14px] leading-relaxed text-white/60">{c.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-pixel text-[10px] text-white/70 transition group-hover:text-white">
                    {s.caseCta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
                {/* La página real del proyecto, tal como se ve hoy, con los
                    datos debajo. El link ya se nombra con el título, así que
                    la imagen no suma texto al lector de pantalla. */}
                <div className="min-w-0 overflow-hidden border border-white/12 bg-[#131313]">
                  <div className="overflow-hidden">
                    <Image
                      src={c.shot}
                      alt=""
                      width={1200}
                      height={750}
                      unoptimized
                      className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-px border-t border-white/12 bg-white/10">
                    {c.facts.map((f) => (
                      <div key={f.label} className="bg-[#131313] p-3 sm:p-5">
                        <p className="font-display text-xl font-medium tabular-nums text-[#0070F3] sm:text-2xl">{f.value}</p>
                        <p className="mt-1 text-[11px] text-white/45">{f.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= OTROS PRODUCTOS =================
            Vienen del sitio personal (schema personal_site). Quedan como
            prueba de que construyo de punta a punta, no como el servicio. */}
        {projects.length > 0 && (
          <section id="proyectos" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20">
            <p className={eyebrow}>{s.projectsEyebrow}</p>
            <h2 className={h2}>{s.projectsTitle}</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectItem key={p.slug} p={p} preview={previewOf(p.slug)} locale={locale} s={s} />
              ))}
            </div>
          </section>
        )}

        {/* ================= QUIÉN HACE EL TRABAJO ================= */}
        <section id="quien" className="scroll-mt-20 border-t border-white/8">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className={eyebrow}>{s.aboutEyebrow}</p>
            <h2 className={h2}>{s.aboutTitle}</h2>
            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
              {/* Capa transparente encima: bloquea drag / click-derecho
                  directo sobre la foto (no es DRM, pero evita el copiado
                  casual). La imagen queda pointer-events-none debajo. */}
              <div className="relative h-24 w-24 shrink-0 select-none">
                <Image
                  src="/valentin.jpg"
                  alt="Valentín Varela"
                  fill
                  unoptimized
                  draggable={false}
                  className="pointer-events-none select-none rounded-full border border-white/12 object-cover"
                />
                <span aria-hidden className="absolute inset-0 z-10 rounded-full" />
              </div>
              <div className="min-w-0">
                <StealthSellerBadge label={s.heroRole} />
                <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-white/60">{s.aboutP1}</p>
                <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-white/60">{s.aboutP2}</p>
                <a
                  href="https://valentinvarela.cloud/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
                >
                  {s.aboutCta}
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/50" aria-hidden />
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
            <p className={eyebrow}>{s.contactEyebrow}</p>
            <h2 className="mt-3 max-w-[20ch] font-display text-3xl font-medium tracking-[-0.025em] text-balance sm:text-4xl">
              {s.contactTitle}
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15px] text-white/60">{s.contactSub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contanos"
                className="inline-flex h-12 items-center justify-center gap-2 bg-[#0070F3] px-6 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
              >
                {s.heroCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
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
              className="h-auto w-full"
            />
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                <CruxMark size={16} color="#8a8a86" />© {new Date().getFullYear()} SurCodia · {s.footerRights}
              </div>
              <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.2em]">
                <Link href={user ? "/ingreso" : "/login"} className="text-white/45 transition hover:text-white">
                  {user ? s.navPanel : s.footerLogin}
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
