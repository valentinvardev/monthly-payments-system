import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/studio/i18n";
import { StudioBrand } from "@/components/studio/pixel";
import { LangToggle } from "@/components/studio/LangToggle";
import { StudioMobileMenu } from "@/components/studio/StudioMobileMenu";

// Piezas compartidas por las páginas de modelo de negocio
// (/modelo-hibrido, /modelo-cursos, /modelo-ecommerce). El contenido
// vive en cada página; acá está la estructura y el estilo común.

export type ModelSection = { id: string; n: string; label: string };

export function ModelHeader({
  locale,
  sections,
}: {
  locale: Locale;
  sections: ModelSection[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a] md:bg-[#0a0a0a]/85 md:backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="min-w-0 transition-opacity hover:opacity-85">
          <StudioBrand />
        </Link>
        <nav className="hidden sm:flex items-center gap-2">
          <Link
            href="/#modelos"
            className="font-pixel px-3 py-1.5 text-[10px] text-white/55 transition hover:text-white"
          >
            Modelos
          </Link>
          <LangToggle locale={locale} />
          <Link
            href="/contanos"
            className="inline-flex h-8 items-center justify-center gap-1.5 bg-[#0070F3] px-3.5 font-pixel text-[10px] text-white transition hover:bg-[#0060d3]"
          >
            Contanos tu proyecto
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
        <StudioMobileMenu
          items={sections.map((s) => ({ href: `#${s.id}`, label: s.label }))}
          locale={locale}
          loginHref="/contanos"
          loginLabel="Contanos tu proyecto"
        />
      </div>
    </header>
  );
}

export function ModelHero({
  eyebrow,
  titleA,
  titleB,
  intro,
}: {
  eyebrow: string;
  titleA: string;
  titleB: string;
  intro: string;
}) {
  return (
    <section className="reveal max-w-[62ch]">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-5xl">
        {titleA} <span className="font-light text-white/55">{titleB}</span>
      </h1>
      <p className="mt-6 text-[15px] leading-relaxed text-white/60">{intro}</p>
    </section>
  );
}

export function CostBlock({ from = "USD 50", note }: { from?: string; note: string }) {
  return (
    <section
      className="reveal mt-10 rounded-lg border border-white/12 bg-[#0f0f0f] p-6 sm:p-7"
      style={{ animationDelay: "80ms" }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            Costo estimado
          </p>
          <p className="mt-2 font-display text-4xl font-medium tracking-[-0.03em]">
            <span className="text-white/50">desde</span>{" "}
            <span className="tabular-nums text-[#0070F3]">{from}</span>
            <span className="text-xl font-light text-white/50"> /mes</span>
          </p>
        </div>
        <p className="max-w-[42ch] text-[13.5px] leading-relaxed text-white/55">{note}</p>
      </div>
    </section>
  );
}

export function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span className="font-mono text-[11px] tabular-nums text-[#0070F3]">{n}</span>
      <h2 className="font-display text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{title}</h2>
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[68ch] space-y-4 text-[14.5px] leading-relaxed text-white/60">
      {children}
    </div>
  );
}

export type Piece = { img: string; title: string; body: string };

export function PieceGrid({ pieces }: { pieces: Piece[] }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      {pieces.map((p) => (
        <article key={p.title} className="rounded-lg border border-white/12 bg-[#0f0f0f] p-6">
          <Image src={p.img} alt="" width={80} height={80} unoptimized className="pixelated" />
          <h3 className="mt-4 text-base font-semibold tracking-[-0.02em]">{p.title}</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{p.body}</p>
        </article>
      ))}
    </div>
  );
}

export type Benefit = { title: string; body: string };

export function BenefitGrid({ benefits }: { benefits: Benefit[] }) {
  return (
    <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/10 sm:grid-cols-2">
      {benefits.map((b) => (
        <article key={b.title} className="bg-[#0f0f0f] p-6">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-white/95">{b.title}</h3>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/60">{b.body}</p>
        </article>
      ))}
    </div>
  );
}

export type Stat = {
  stat: string;
  label: string;
  body: string;
  source: string;
  href: string;
};

export function StatList({ stats }: { stats: Stat[] }) {
  return (
    <div className="mt-8 space-y-4">
      {stats.map((d) => (
        <article
          key={d.stat + d.label}
          className="grid gap-5 rounded-lg border border-white/12 bg-[#0f0f0f] p-6 sm:grid-cols-[140px_1fr]"
        >
          <div>
            <p className="font-display text-3xl font-medium tabular-nums text-[#0070F3]">
              {d.stat}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/45">{d.label}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] leading-relaxed text-white/65">{d.body}</p>
            <a
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white/80"
            >
              {d.source}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export function NumberedList({ items }: { items: Benefit[] }) {
  return (
    <div className="mt-8 space-y-5">
      {items.map((s, i) => (
        <article
          key={s.title}
          className="flex gap-5 border-t border-white/10 pt-5 first:border-t-0 first:pt-0"
        >
          <span className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-white/30">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-white/95">
              {s.title}
            </h3>
            <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-white/60">
              {s.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// Integraciones: idéntico en las tres páginas de modelo.
// ---------------------------------------------------------------

const INTEGRATIONS: Benefit[] = [
  {
    title: "Google Analytics 4",
    body: "Dejás de decidir por intuición. Vas a saber por dónde entra la gente, qué páginas venden, cuáles hacen ruido y en qué paso exacto se cae una compra. Queda configurado desde el primer día, así los datos empiezan a acumularse antes de que los necesites.",
  },
  {
    title: "Meta Pixel (Facebook e Instagram)",
    body: "Cada visita queda registrada para que puedas volver a mostrarle tu producto a quien ya te miró y no compró — el público más barato y más probable que existe. Además le enseña a Meta cómo es tu comprador para que salga a buscar más parecidos.",
  },
  {
    title: "TikTok Pixel",
    body: "Si vendés donde está la atención, necesitás medir ahí. El píxel de TikTok atribuye qué videos traen ventas de verdad y no solo vistas, así sabés en qué contenido conviene invertir.",
  },
  {
    title: "Conversiones y catálogo",
    body: "Los eventos importantes —ver producto, agregar al carrito, iniciar pago, comprar— se envían con el valor de cada operación. Sin eso las plataformas optimizan a ciegas; con eso aprenden a traerte compradores en vez de curiosos.",
  },
  {
    title: "Newsletter propia",
    body: "Formulario de suscripción integrado y lista administrable desde tu panel. Es el único canal que realmente te pertenece: no depende del alcance de una red ni de un algoritmo que cambia. Cada lanzamiento le llega directo a quien ya levantó la mano.",
  },
  {
    title: "Emails que salen solos",
    body: "Confirmación de compra, acceso al curso, recordatorio de turno, aviso de vencimiento. Se disparan cuando corresponde, con tu marca, sin que nadie tenga que acordarse. Menos consultas de «¿me llegó?» y más confianza en cada operación.",
  },
  {
    title: "SEO y redes, resuelto",
    body: "Títulos, descripciones, sitemap y las tarjetas que se ven al compartir un link en WhatsApp o Instagram vienen configurados. Tu contenido llega presentable a Google y a los chats, sin plugins ni retoques manuales.",
  },
  {
    title: "Cobros del país real",
    body: "Mercado Pago con tarjetas y cuotas, más transferencia y cripto si te sirve. El pago confirma solo y destraba el acceso al instante: cero coordinación manual, cero «ya te pasé el comprobante».",
  },
];

export function IntegrationsSection({ id = "integraciones", n }: { id?: string; n: string }) {
  return (
    <section id={id} className="scroll-mt-24">
      <SectionHead n={n} title="Todo lo que ya viene preparado" />
      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <Prose>
          <p>
            Buena parte de lo que otras plataformas cobran aparte, acá viene de fábrica. No son
            extras que se cotizan después: son las conexiones que cualquier negocio necesita para
            vender, medir y volver a contactar a su gente.
          </p>
          <p>
            Lo importante no es la lista de logos, sino lo que habilita: dejar de adivinar qué
            funciona, poder invertir en publicidad sabiendo cuánto vuelve, y tener un canal propio
            para hablarle a tus clientes sin pedirle permiso a nadie.
          </p>
        </Prose>
        <Image
          src="/pixel/modelo-medicion.png"
          alt=""
          width={110}
          height={110}
          unoptimized
          className="pixelated hidden sm:block"
        />
      </div>
      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/10 sm:grid-cols-2">
        {INTEGRATIONS.map((f) => (
          <article key={f.title} className="bg-[#0f0f0f] p-6">
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-white/95">
              {f.title}
            </h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/60">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ClosingCta({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-8 rounded-lg border border-white/12 bg-[#0f0f0f] p-8">
      <h3 className="font-display text-2xl font-medium tracking-[-0.025em]">{title}</h3>
      <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-white/60">{body}</p>
      <Link
        href="/contanos"
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 bg-[#0070F3] px-6 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
      >
        Contanos tu proyecto
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

const ALL_MODELS = [
  { href: "/modelo-hibrido", label: "Modelo híbrido", hint: "Tienda + cursos + membresía" },
  { href: "/modelo-cursos", label: "Academia digital", hint: "Cursos, comunidad y suscripción" },
  { href: "/modelo-ecommerce", label: "E-commerce", hint: "Catálogo, checkout y envíos" },
];

export function OtherModels({ current }: { current: string }) {
  const others = ALL_MODELS.filter((m) => m.href !== current);
  return (
    <section className="mt-20 border-t border-white/10 pt-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
        Otros modelos
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {others.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-center justify-between gap-4 rounded-lg border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
          >
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                {m.label}
              </span>
              <span className="mt-1 block text-[13px] text-white/50">{m.hint}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-white/80" />
          </Link>
        ))}
      </div>
    </section>
  );
}
