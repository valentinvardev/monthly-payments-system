import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLocale } from "@/lib/studio/i18n";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { TocNav } from "@/components/studio/TocNav";
import {
  BenefitGrid,
  ClosingCta,
  CostBlock,
  IntegrationsSection,
  ModelHeader,
  ModelHero,
  NumberedList,
  OtherModels,
  PieceGrid,
  Prose,
  SectionHead,
  StatList,
  type Benefit,
  type ModelSection,
  type Piece,
  type Stat,
} from "@/components/studio/model-page";

export const metadata: Metadata = {
  title: "E-commerce: tienda online propia, checkout y envíos",
  description:
    "Cómo se arma una tienda online propia: catálogo, checkout sin fricción, envíos y panel. Beneficios, datos de conversión y casos reales.",
};

const SECTIONS: ModelSection[] = [
  { id: "que-es", n: "01", label: "Tienda propia vs alquilada" },
  { id: "casos", n: "02", label: "Casos reales" },
  { id: "piezas", n: "03", label: "Las piezas de la tienda" },
  { id: "beneficios", n: "04", label: "Beneficios para tu negocio" },
  { id: "integraciones", n: "05", label: "Todo lo que viene preparado" },
  { id: "datos", n: "06", label: "Los datos detrás del diseño" },
  { id: "sistema", n: "07", label: "Cómo está construido" },
  { id: "empezar", n: "08", label: "Cómo empezamos" },
];

const PIEZAS: Piece[] = [
  {
    img: "/pixel/hibrido-tienda.png",
    title: "Catálogo",
    body: "Productos con varias fotos, variantes (talle, color, sabor), stock y categorías. Soporta físicos, digitales que se entregan solos al pagar, y personalizados que abren una conversación antes de producir. Todo se carga desde el panel.",
  },
  {
    img: "/pixel/modelo-checkout.png",
    title: "Checkout sin fricción",
    body: "Pocos pasos, total visible desde el principio y compra sin obligar a crear cuenta. Mercado Pago con tarjetas y cuotas, más transferencia si te conviene. Acá es donde se gana o se pierde la venta que ya tenías hecha.",
  },
  {
    img: "/pixel/modelo-envios.png",
    title: "Envíos y retiro",
    body: "Costo de envío por zona, retiro en local y seguimiento del estado del pedido. El cliente sabe cuánto va a pagar antes de llegar al final, que es justo lo que evita que abandone el carrito en el último paso.",
  },
  {
    img: "/pixel/modelo-email.png",
    title: "Panel y posventa",
    body: "Pedidos, estados, clientes y stock en un solo lugar. Los emails de confirmación y de envío salen solos con tu marca, y la lista de compradores queda lista para tu próxima campaña.",
  },
];

const BENEFICIOS: Benefit[] = [
  {
    title: "Sin comisión por venta",
    body: "Los marketplaces y algunas plataformas se llevan un porcentaje de cada operación, para siempre. Una tienda propia tiene costo fijo: cuanto más vendés, mejor te queda el margen, en lugar de pagar más por vender más.",
  },
  {
    title: "El cliente es tuyo",
    body: "En un marketplace la venta la hace ellos: no te llevás el email ni podés avisarle de tu próximo lanzamiento. Con tienda propia cada compra suma un contacto a tu lista, y la segunda venta a esa persona cuesta casi nada.",
  },
  {
    title: "Tu marca, no una plantilla más",
    body: "Colores, tipografías, fotos y tono trabajando a favor de tu identidad en cada pantalla. La tienda deja de parecerse a las otras mil hechas con el mismo tema y empieza a parecerse a vos.",
  },
  {
    title: "Menos carritos abandonados",
    body: "Un checkout corto, con costos claros desde el inicio y sin registro obligatorio, ataca directamente las causas más citadas de abandono. Cada punto que recuperás es venta que ya tenías y se te escapaba en el último paso.",
  },
  {
    title: "Rápida en el celular, donde se compra",
    body: "La mayoría de tu tráfico llega desde el teléfono y es también donde más carritos se pierden. La tienda se arma pensada para esa pantalla primero, no como una versión reducida del escritorio.",
  },
  {
    title: "Menos tiempo administrando",
    body: "Cobros confirmados solos, emails de confirmación y envío automáticos, stock que se descuenta al vender. Se terminan las horas de pasar pedidos a una planilla y responder «¿me llegó la transferencia?».",
  },
  {
    title: "Publicidad que se puede medir",
    body: "Con los píxeles y el analytics configurados desde el día uno sabés qué campaña trajo qué venta y cuánto costó. Podés invertir con criterio en vez de apostar y esperar.",
  },
  {
    title: "Crece sin rehacerse",
    body: "Sumar categorías, variantes, una línea nueva o hasta cursos y membresía después no implica empezar de nuevo. La base es la misma y se le agregan piezas cuando el negocio las pide.",
  },
];

const DATOS: Stat[] = [
  {
    stat: "70%",
    label: "de los carritos se abandonan",
    body: "Promedio de más de 48 estudios: siete de cada diez compras iniciadas no se completan, y en celular trepa al 85%. No es que la gente no quiera comprar: es que el proceso las expulsa antes de terminar.",
    source: "Baymard Institute",
    href: "https://baymard.com/lists/cart-abandonment-rate",
  },
  {
    stat: "39%",
    label: "abandona por costos sorpresa",
    body: "La razón número uno declarada para abandonar un carrito son los costos extra que aparecen recién al final. Mostrar el envío y el total desde el principio no es un detalle de diseño: es la fuga más grande y la más fácil de tapar.",
    source: "Baymard Institute",
    href: "https://baymard.com/lists/cart-abandonment-rate",
  },
  {
    stat: "+35%",
    label: "de conversión con mejor checkout",
    body: "Un sitio promedio puede subir su conversión un 35% solo corrigiendo el diseño de su proceso de compra. Sin gastar un peso más en publicidad: es la misma gente que ya estaba comprando, terminando de comprar.",
    source: "Baymard Institute",
    href: "https://baymard.com/lists/cart-abandonment-rate",
  },
  {
    stat: "+8,4%",
    label: "de conversión por cada 0,1s más rápido",
    body: "Google y Deloitte midieron 37 marcas: mejorar una décima de segundo la carga en celular aumentó las conversiones un 8,4% y el ticket promedio un 9,2%. Mismo tráfico, mismo costo de adquisición, más facturación.",
    source: "Google + Deloitte, «Milliseconds Make Millions»",
    href: "https://web.dev/case-studies/milliseconds-make-millions",
  },
  {
    stat: "59%",
    label: "de las ventas online son desde el celular",
    body: "El comercio móvil ya es la mayoría del comercio electrónico a nivel global. Si la experiencia en teléfono es una versión apretada del escritorio, estás complicando justo al canal por donde entra la mayor parte de tu gente.",
    source: "Mobile commerce benchmarks 2025",
    href: "https://www.sellerscommerce.com/blog/mobile-commerce-statistics/",
  },
  {
    stat: "75%",
    label: "juzga tu credibilidad por el diseño",
    body: "Tres de cada cuatro personas evalúan cuán confiable es una empresa por el diseño de su sitio, y en rubros donde hay que poner la tarjeta ese peso sube. Antes de comparar precio, la gente decide si te va a confiar los datos.",
    source: "Stanford Web Credibility Project",
    href: "https://credibility.stanford.edu/",
  },
];

const SISTEMA: Benefit[] = [
  {
    title: "El pago confirma solo",
    body: "Mercado Pago le avisa a la tienda cuando el cobro se acredita y el pedido cambia de estado en el momento, aunque el cliente haya cerrado la pestaña. Los productos digitales se entregan ahí mismo, sin intervención de nadie.",
  },
  {
    title: "El stock se descuenta al vender",
    body: "Cada compra actualiza el inventario, así no vendés algo que ya no tenés. Un problema chico con diez productos que se vuelve un dolor de cabeza cuando son doscientos.",
  },
  {
    title: "Las fotos se sirven optimizadas",
    body: "Las imágenes se entregan en el tamaño y formato que corresponde a cada pantalla. Es lo que hace que la tienda cargue rápido en un celular con mala señal sin que tengas que preparar versiones a mano.",
  },
  {
    title: "Cargás productos sin ayuda técnica",
    body: "Alta de productos, variantes, precios, fotos, categorías y estados de pedido se manejan desde el panel completando formularios. Cambiar un precio o publicar una colección no depende de la agenda de nadie.",
  },
  {
    title: "Las páginas llegan casi listas",
    body: "El catálogo se arma en el servidor y llega renderizado al navegador: el cliente ve productos enseguida en vez de una pantalla vacía cargando. Con las cifras de velocidad de arriba, eso es facturación.",
  },
  {
    title: "Preparada para Google desde el inicio",
    body: "Direcciones limpias, títulos y descripciones por producto, sitemap y datos estructurados. Tus productos pueden aparecer en búsquedas sin depender de instalar y configurar plugins después.",
  },
];

export default async function ModeloEcommercePage() {
  const locale = await getLocale();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />
      <ModelHeader locale={locale} sections={SECTIONS} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14">
        <ModelHero
          eyebrow="ANÁLISIS DE SISTEMA · E-COMMERCE"
          titleA="Una tienda que es tuya:"
          titleB="tu marca, tus clientes, tu margen."
          intro="Vender online es fácil de empezar y difícil de sostener: comisiones que se comen el margen, plantillas que hacen que todas las tiendas se parezcan, y un checkout que pierde compras que ya estaban hechas. Esta es la anatomía de una tienda propia, contada sin tecnicismos y con los números que explican cada decisión."
        />

        <CostBlock note="Incluye la tienda funcionando, el panel para administrarla y el mantenimiento. El monto final depende del tamaño del catálogo y del volumen de pedidos: te lo confirmamos en la propuesta, sin sorpresas después." />

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          <TocNav sections={SECTIONS} />

          <div className="min-w-0 space-y-20">
            <section id="que-es" className="scroll-mt-24">
              <SectionHead n="01" title="Tienda propia vs alquilada" />
              <Prose>
                <p>
                  Casi todo negocio que vende online empieza igual: un marketplace, una
                  plataforma con plantilla o directamente Instagram con pedidos por mensaje
                  privado. Funciona para arrancar, y en algún momento deja de alcanzar.
                </p>
                <p>
                  El costo real no es la mensualidad: es la comisión sobre cada venta, la
                  imposibilidad de diferenciarte cuando tu tienda usa el mismo tema que otras
                  mil, y no poder tocar justo lo que más te está costando plata — el paso donde
                  la gente abandona.
                </p>
                <p>
                  Una tienda propia cambia esas tres cosas a la vez: costo fijo previsible,
                  identidad completa y libertad para diseñar el camino de compra alrededor de
                  cómo vende tu negocio, no de cómo lo impone una plantilla.
                </p>
              </Prose>
            </section>

            <section id="casos" className="scroll-mt-24">
              <SectionHead n="02" title="Casos reales" />
              <Prose>
                <p>
                  <strong className="text-white/85">La Reina de Bastos</strong> vende productos
                  físicos, digitales y personalizados desde un catálogo propio, con checkout de
                  Mercado Pago y entrega automática de lo digital. La tienda convive con cursos y
                  una membresía en la misma plataforma.
                </p>
                <p>
                  <strong className="text-white/85">EuroDeco</strong> es una tienda de decoración
                  con catálogo y pedidos online, pensada para que el equipo cargue productos y
                  gestione consultas sin depender de nadie.
                </p>
              </Prose>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://lareinadebastos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#ededed] px-5 font-pixel text-[10px] text-[#0a0a0a] transition hover:bg-white"
                >
                  La Reina de Bastos
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://eurodecoflorida.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 border border-white/12 bg-[#161616] px-5 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
                >
                  EuroDeco
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </section>

            <section id="piezas" className="scroll-mt-24">
              <SectionHead n="03" title="Las piezas de la tienda" />
              <Prose>
                <p>
                  Una tienda es más que un catálogo: es todo el camino desde que alguien ve un
                  producto hasta que lo recibe y vuelve a comprar. Estas son las cuatro partes
                  que sostienen ese recorrido.
                </p>
              </Prose>
              <PieceGrid pieces={PIEZAS} />
            </section>

            <section id="beneficios" className="scroll-mt-24">
              <SectionHead n="04" title="Beneficios para tu negocio" />
              <Prose>
                <p>
                  Estos son los cambios concretos de pasar de una plataforma alquilada a una
                  tienda propia, ordenados por el impacto que suelen tener en la facturación.
                </p>
              </Prose>
              <BenefitGrid benefits={BENEFICIOS} />
            </section>

            <IntegrationsSection n="05" />

            <section id="datos" className="scroll-mt-24">
              <SectionHead n="06" title="Los datos detrás del diseño" />
              <Prose>
                <p>
                  En e-commerce cada decisión de diseño se puede medir en ventas. Estas son las
                  cifras que más pesan al momento de definir cómo se arma una tienda.
                </p>
              </Prose>
              <StatList stats={DATOS} />
            </section>

            <section id="sistema" className="scroll-mt-24">
              <SectionHead n="07" title="Cómo está construido" />
              <Prose>
                <p>
                  Sin tecnicismos: esto es lo que hace que la tienda funcione sola y que puedas
                  operarla sin depender de nadie.
                </p>
              </Prose>
              <NumberedList items={SISTEMA} />
            </section>

            <section id="empezar" className="scroll-mt-24">
              <SectionHead n="08" title="Cómo empezamos" />
              <Prose>
                <p>
                  No hace falta tener el catálogo perfecto ni las fotos finales. Con la lista de
                  productos, cómo cobrás hoy y cómo enviás alcanza para definir el alcance.
                </p>
                <p>
                  Nos contás qué vendés, por dónde vendés hoy y qué parte te está consumiendo más
                  tiempo. Armamos una propuesta concreta, con alcance y precio, en el día.
                </p>
              </Prose>
              <ClosingCta
                title="¿Vendés online y la plataforma te queda chica?"
                body="Marcas que venden por Instagram, tiendas en marketplaces con margen ajustado, negocios con plantilla que ya no los representa. Contanos cómo vendés hoy y te respondemos en el día."
              />
            </section>

            <div>
              <p className="text-[13.5px] leading-relaxed text-white/55">
                ¿Además enseñás o querés sumar una membresía? Mirá el{" "}
                <Link
                  href="/modelo-hibrido"
                  className="text-white/85 underline decoration-white/30 underline-offset-2 transition hover:text-white"
                >
                  modelo híbrido
                </Link>
                , que combina tienda, cursos y comunidad sobre esta misma base.
              </p>
            </div>

            <OtherModels current="/modelo-ecommerce" />
          </div>
        </div>
      </main>
    </div>
  );
}
