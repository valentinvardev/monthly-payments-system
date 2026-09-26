import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLocale } from "@/lib/studio/i18n";
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
  type Benefit,
  type ModelSection,
} from "@/components/studio/model-page";

export const metadata: Metadata = {
  title: "Stealth Seller: product engineering",
  description:
    "Cómo trabajo como product engineer en Stealth Seller, la plataforma de investigación de productos para revendedores de Amazon: entender cómo decide el usuario y construir rápido con agentes de IA.",
};

// Todo lo que se cuenta del producto sale de lo que Stealth Seller publica
// en stealthseller.co. Nada de métricas internas, clientes ni nombres: la
// página habla del producto público y del trabajo de Valentín.
const SECTIONS: ModelSection[] = [
  { id: "mercado", n: "01", label: "El mercado" },
  { id: "producto", n: "02", label: "Qué hace el producto" },
  { id: "trabajo", n: "03", label: "Mi trabajo ahí" },
  { id: "tu-empresa", n: "04", label: "Lo mismo, en tu empresa" },
];

const FACTS: { value: string; label: string }[] = [
  { value: "600", label: "tiendas de vendedores que se pueden vigilar, en el plan más alto" },
  { value: "4", label: "números por publicación: fees, ganancia, ROI y costo máximo" },
  { value: "2", label: "lugares de uso: extensión de Chrome y app web" },
];

const PRODUCTO: Benefit[] = [
  {
    title: "Calculadora de ganancia con IA",
    body: "Los fees de Amazon, la ganancia, el ROI y el costo máximo de una publicación, en el momento. Es el número con el que se decide si un producto vale la compra.",
  },
  {
    title: "Vendedores vigilados",
    body: "Se siguen hasta 600 tiendas de otros vendedores y llega un aviso cuando publican algo nuevo. Es una pista de qué están comprando los que ya venden.",
  },
  {
    title: "Stock en retailers",
    body: "Confirma si el producto está disponible en la tienda donde se compraría, antes de invertir tiempo en analizarlo.",
  },
  {
    title: "Búsqueda con IA",
    body: "Encuentra el producto en las tiendas de retail sin buscarlo a mano, una por una.",
  },
  {
    title: "Extensión de Chrome",
    body: "Los números aparecen sobre la misma página de Amazon. No hace falta cambiar de pestaña ni copiar nada.",
  },
  {
    title: "Carpetas",
    body: "Lo que vale la pena queda guardado y ordenado, listo para decidir la compra.",
  },
];

const TRABAJO: Benefit[] = [
  {
    title: "La decisión antes que la función",
    body: "Cada función nueva responde a un paso de cómo decide el revendedor. Si no se puede decir qué paso acelera o qué riesgo baja, no es prioridad.",
  },
  {
    title: "Medir antes de construir",
    body: "Qué usa la gente, dónde abandona, qué pregunta en soporte. Cuando dos de esas fuentes dicen lo mismo, eso se construye primero.",
  },
  {
    title: "Rápido, con IA y con criterio",
    body: "Agentes de IA en el flujo de desarrollo para pasar de conversación a producción en días. La velocidad la pone la IA; el criterio de qué construir, no.",
  },
  {
    title: "Salir chico y ajustar",
    body: "Cada función sale en la versión más chica que ya sirve. Lo que la gente hace con ella decide la siguiente vuelta.",
  },
];

function FactsRow() {
  return (
    <section
      className="reveal mt-10 grid gap-px overflow-hidden border border-white/12 bg-white/10 sm:grid-cols-3"
      style={{ animationDelay: "80ms" }}
    >
      {FACTS.map((f) => (
        <div key={f.label} className="bg-[#0f0f0f] p-6">
          <p className="font-display text-3xl font-medium tabular-nums tracking-[-0.03em] text-[#0070F3]">
            {f.value}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-white/55">{f.label}</p>
        </div>
      ))}
    </section>
  );
}

export default async function CasoStealthSellerPage() {
  const [locale, others] = await Promise.all([getLocale(), getOtherProjects()]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />
      <ModelHeader locale={locale} sections={SECTIONS} />

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

        <ModelHero
          eyebrow="CASO · PRODUCT ENGINEERING"
          titleA="Construir al ritmo"
          titleB="de lo que piden los usuarios."
          intro="Stealth Seller es una plataforma de investigación de productos para revendedores de Amazon: calcula fees, ganancia, ROI y costo máximo de cada publicación, vigila las tiendas de otros vendedores y confirma si hay stock en los retailers. Trabajo ahí como product engineer."
        />

        <a
          href="https://stealthseller.co"
          target="_blank"
          rel="noopener noreferrer"
          className="reveal mt-7 inline-flex h-10 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
          style={{ animationDelay: "60ms" }}
        >
          Visitar stealthseller.co
          <ArrowUpRight className="h-3.5 w-3.5 text-white/50" aria-hidden />
        </a>

        <SiteShot src="/previews/stealth-seller.jpg" domain="stealthseller.co" />

        <FactsRow />

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          <TocNav sections={SECTIONS} />

          <div className="min-w-0 space-y-20">
            <section id="mercado" className="scroll-mt-24">
              <SectionHead n="01" title="El mercado" />
              <Prose>
                <p>
                  Revender en Amazon es arbitraje: comprar barato en un retailer y vender más caro
                  en Amazon. Lo difícil no es vender. Es decidir qué comprar, porque un producto
                  rentable hoy puede estar saturado de vendedores cuando llega la mercadería.
                </p>
                <p>
                  Hace años que hay herramientas para decidirlo.{" "}
                  <strong className="text-white/85">
                    La diferencia no está en tener más funciones.
                  </strong>{" "}
                  Está en entender mejor que nadie cómo decide el usuario y llegar antes con lo
                  que le falta.
                </p>
              </Prose>
            </section>

            <section id="producto" className="scroll-mt-24">
              <SectionHead n="02" title="Qué hace el producto" />
              <Prose>
                <p>
                  Todo el camino, de encontrar un producto a comprarlo, en un mismo lugar. Cada
                  pieza responde a una pregunta que el revendedor se hace antes de poner plata.
                </p>
              </Prose>
              <BenefitGrid benefits={PRODUCTO} />
            </section>

            <section id="trabajo" className="scroll-mt-24">
              <SectionHead n="03" title="Mi trabajo ahí" />
              <Prose>
                <p>
                  Un product engineer está entre el usuario y el código. El trabajo no empieza en
                  el editor: empieza en cómo decide un revendedor. Qué mira primero, qué dato le
                  hace descartar un producto en segundos, qué le falta para comprar tranquilo.
                </p>
                <p>
                  Con eso se decide qué construir, y se construye rápido: llegar primero con lo
                  que el usuario pide es la ventaja.
                </p>
              </Prose>
              <BenefitGrid benefits={TRABAJO} />
            </section>

            <section id="tu-empresa" className="scroll-mt-24">
              <SectionHead n="04" title="Lo mismo, en tu empresa" />
              <Prose>
                <p>
                  SurCodia es este mismo método aplicado a tu operación: entender cómo se trabaja
                  de verdad, encontrar el paso donde se pierde tiempo o plata, y construir la
                  solución rápido, midiendo el antes y el después.
                </p>
              </Prose>
              <ClosingCta
                locale={locale}
                title="¿Dónde se traba tu operación?"
                body="Pedí el diagnóstico: una reunión y tres mejoras con impacto. Te respondo en el día."
              />
            </section>

            <section className="border-t border-white/10 pt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                Seguir mirando
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/casos/halley"
                  className="group flex items-center justify-between gap-4 border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                      Caso Halley Audiovisual
                    </span>
                    <span className="mt-1 block text-[13px] text-white/50">
                      Cobranza en cuotas para 2.000 familias
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
                        Otros productos
                      </span>
                      <span className="mt-1 block text-[13px] text-white/50">
                        Lo que construí de punta a punta
                      </span>
                    </span>
                  </Link>
                )}
              </div>
              <p className="mt-10 max-w-[68ch] text-[12px] leading-relaxed text-white/55">
                Stealth Seller y su logo son marcas de sus dueños. Esta página cuenta mi trabajo
                como product engineer ahí. No es una publicación oficial de Stealth Seller, y
                Stealth Seller no respalda los servicios de SurCodia.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
