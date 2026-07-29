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
  title: "Academia digital: cursos online con comunidad y suscripción",
  description:
    "Cómo se arma una plataforma de cursos propia: módulos, liberación programada, progreso, comunidad y membresía. Beneficios, datos de finalización y caso real.",
};

const SECTIONS: ModelSection[] = [
  { id: "que-es", n: "01", label: "Qué es una academia digital" },
  { id: "por-que", n: "02", label: "Por qué dejar el marketplace" },
  { id: "piezas", n: "03", label: "Las piezas de la academia" },
  { id: "beneficios", n: "04", label: "Beneficios para tu academia" },
  { id: "integraciones", n: "05", label: "Todo lo que viene preparado" },
  { id: "datos", n: "06", label: "Los datos detrás del diseño" },
  { id: "sistema", n: "07", label: "Cómo está construido" },
  { id: "empezar", n: "08", label: "Cómo empezamos" },
];

const PIEZAS: Piece[] = [
  {
    img: "/pixel/hibrido-curso.png",
    title: "Cursos, módulos y clases",
    body: "Cada curso se arma en módulos y lecciones con video, texto y material descargable. Podés marcar clases como muestra gratuita para que la gente pruebe antes de comprar: es la forma más barata de convencer a alguien que todavía duda.",
  },
  {
    img: "/pixel/hibrido-agenda.png",
    title: "Liberación programada",
    body: "En lugar de entregar todo el curso de golpe, las clases se habilitan según un calendario. El alumno avanza al ritmo pensado, vuelve cada semana, y el contenido no se descarga entero el primer día para no verse nunca más.",
  },
  {
    img: "/pixel/hibrido-membresia.png",
    title: "Comunidad y membresía",
    body: "Un espacio privado donde publicás contenido y los alumnos comentan y se responden entre ellos. La suscripción destraba todos los cursos: en vez de vender uno y desaparecer, sostenés una relación mensual con la misma persona.",
  },
  {
    img: "/pixel/modelo-checkout.png",
    title: "Inscripción y cobro",
    body: "El alumno se inscribe y paga en el momento, con tarjeta y cuotas. El acceso se destraba solo al confirmarse el pago, sin que nadie tenga que habilitar nada a mano ni pedir comprobantes por mensaje.",
  },
];

const BENEFICIOS: Benefit[] = [
  {
    title: "Terminan el curso, y eso lo cambia todo",
    body: "Un alumno que termina renueva, recomienda y aparece en tus testimonios. Uno que abandona en la clase dos pide reembolso y no vuelve. La estructura, el progreso visible y la comunidad son lo que separa un caso del otro.",
  },
  {
    title: "El precio lo ponés vos",
    body: "En un marketplace tu curso aparece al lado de otros mil, comparado por precio y empujado a los descuentos de la plataforma. En tu propia academia el valor lo sostiene tu marca, no una grilla de competidores.",
  },
  {
    title: "Sin comisiones sobre cada venta",
    body: "Las plataformas de cursos se quedan con una parte de todo lo que vendés, para siempre. Un sistema propio tiene un costo fijo previsible: cuanto más vendés, más conviene, en vez de al revés.",
  },
  {
    title: "De venta suelta a ingreso mensual",
    body: "Vender cursos de a uno obliga a lanzar todo el tiempo. La membresía convierte esos lanzamientos en una base estable: sabés con cuánto contás cada mes y los lanzamientos pasan a ser el extra, no la supervivencia.",
  },
  {
    title: "La comunidad hace parte del trabajo",
    body: "Cuando los alumnos se responden entre ellos, resuelven dudas que hoy contestás vos por privado y generan la prueba social que convence a los que están mirando desde afuera. Es el activo que ninguna plataforma ajena te deja construir.",
  },
  {
    title: "Sabés quién está por abandonar",
    body: "El progreso de cada alumno queda registrado. Podés ver quién no entra hace dos semanas y escribirle antes de que se dé de baja, en lugar de enterarte cuando ya canceló.",
  },
  {
    title: "Los alumnos son tuyos",
    body: "En las plataformas grandes el alumno es de ellas: no tenés su email ni podés contactarlo para tu próximo lanzamiento. Acá la lista es tuya, exportable, y cada lanzamiento arranca con público propio en vez de desde cero.",
  },
  {
    title: "Escala sin más trabajo",
    body: "Diez alumnos o mil consumen el mismo esfuerzo operativo: el sistema cobra, da acceso, entrega y avisa igual. Lo único que necesitás sumar es contenido, que es donde está tu valor.",
  },
];

const DATOS: Stat[] = [
  {
    stat: "64%",
    label: "de finalización con estructura",
    body: "Los cursos con fechas, cohorte y contenido liberado por etapas llegan al 64% de finalización, frente al 48% de los cursos totalmente libres. Solo por agregar estructura, un tercio más de alumnos llega al final.",
    source: "Ruzuku (datos de plataforma)",
    href: "https://www.ruzuku.com/learn/articles/cohort-vs-self-paced",
  },
  {
    stat: "65,5%",
    label: "termina si hay comunidad",
    body: "Cuando el curso incluye espacio de comentarios y discusión, la finalización sube a 65,5% contra 42,6% sin ella. La comunidad no es un extra simpático: es la diferencia entre que la mitad de tu clase termine o abandone.",
    source: "Ruzuku (datos de plataforma)",
    href: "https://www.ruzuku.com/learn/articles/cohort-vs-self-paced",
  },
  {
    stat: "12,6%",
    label: "termina en las plataformas masivas",
    body: "El promedio de finalización en los grandes marketplaces de cursos ronda el 12%. Es el techo de un modelo donde nadie te espera ni nota si dejaste de entrar. Una academia propia con acompañamiento juega en otra categoría.",
    source: "Ruzuku (datos de plataforma)",
    href: "https://www.ruzuku.com/learn/articles/cohort-vs-self-paced",
  },
  {
    stat: "3–5×",
    label: "más valor por alumno con suscripción",
    body: "Un cliente de suscripción genera entre tres y cinco veces más ingresos a lo largo de la relación que uno de compra única, y cerca del 70% de la facturación llega por retención y no por captación. Retener sale mucho más barato que conseguir alumnos nuevos.",
    source: "Swell / benchmarks de subscription commerce",
    href: "https://www.swell.is/content/subscription-commerce-statistics",
  },
  {
    stat: "75%",
    label: "juzga tu credibilidad por el diseño",
    body: "Tres de cada cuatro personas evalúan cuán confiable es una empresa a partir del diseño de su sitio. Cuando alguien está por confiarte su formación y su dinero, el sitio es la primera prueba de que del otro lado hay algo serio.",
    source: "Stanford Web Credibility Project",
    href: "https://credibility.stanford.edu/",
  },
  {
    stat: "+8,4%",
    label: "de conversión por cada 0,1s más rápido",
    body: "Google y Deloitte midieron 37 marcas: mejorar una décima de segundo la carga en celular subió las conversiones un 8,4%. Tus alumnos entran desde el teléfono, muchas veces con mala señal. La velocidad es parte de la experiencia de estudio.",
    source: "Google + Deloitte, «Milliseconds Make Millions»",
    href: "https://web.dev/case-studies/milliseconds-make-millions",
  },
];

const SISTEMA: Benefit[] = [
  {
    title: "El acceso se decide en un solo lugar",
    body: "La suscripción activa destraba todos los cursos, la compra suelta destraba el suyo y las clases con fecha futura aparecen recién ese día. Es una única regla central: nadie tiene que habilitar alumnos a mano ni llevar una lista aparte.",
  },
  {
    title: "El progreso queda guardado por alumno",
    body: "Cada lección completada se registra. El alumno retoma donde dejó, ve cuánto le falta, y vos ves quién avanza y quién se quedó. Ese dato es la base para escribirle a tiempo a quien está por abandonar.",
  },
  {
    title: "El pago habilita solo",
    body: "Cuando el cobro se confirma, el sistema recibe el aviso y da el acceso en el momento, aunque el alumno haya cerrado la pestaña. Se termina el «te transferí, ¿me habilitás?» a las once de la noche.",
  },
  {
    title: "Cargás las clases sin ayuda técnica",
    body: "Crear un curso, ordenar sus módulos, subir videos y material, programar fechas y publicar en la comunidad se hace desde el panel completando formularios. Lanzar contenido nuevo no depende de la agenda de un desarrollador.",
  },
  {
    title: "Los videos no se sirven desde tu servidor",
    body: "El contenido pesado se apoya en servicios pensados para eso, así reproduce fluido sin encarecer la infraestructura ni frenar el resto del sitio. Vos subís, el sistema se encarga de entregarlo bien.",
  },
  {
    title: "La marca es tuya de punta a punta",
    body: "Colores, tipografías y tono se ajustan a tu identidad, incluso en vivo desde un editor propio. El alumno recuerda tu academia, no el logo de la plataforma donde estaba alojado el curso.",
  },
];

export default async function ModeloCursosPage() {
  const locale = await getLocale();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />
      <ModelHeader locale={locale} sections={SECTIONS} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14">
        <ModelHero
          eyebrow="ANÁLISIS DE SISTEMA · ACADEMIA DIGITAL"
          titleA="Tu academia online,"
          titleB="con tu marca y tus alumnos."
          intro="Enseñar online dejó de ser subir videos a una plataforma ajena y esperar. Esta es la anatomía de una academia propia: cursos con estructura, comunidad que sostiene al alumno hasta el final, y una suscripción que convierte lanzamientos sueltos en ingreso mensual. Contado sin tecnicismos, con datos de finalización reales."
        />

        <CostBlock note="Incluye la plataforma funcionando, el panel para cargar cursos y el mantenimiento. El monto final depende de cuántos cursos y qué volumen de alumnos manejes: te lo confirmamos en la propuesta, sin sorpresas después." />

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          <TocNav sections={SECTIONS} />

          <div className="min-w-0 space-y-20">
            <section id="que-es" className="scroll-mt-24">
              <SectionHead n="01" title="Qué es una academia digital" />
              <Prose>
                <p>
                  Una academia digital es tu propio espacio de formación: cursos organizados,
                  alumnos con progreso, una comunidad alrededor y un cobro que funciona solo.
                  Todo bajo tu dominio y tu marca, en vez de repartido entre una plataforma de
                  cursos, un grupo de WhatsApp y una carpeta compartida.
                </p>
                <p>
                  Sirve para academias e institutos, profesores independientes, coaches y
                  consultores, marcas que enseñan a usar lo que venden, y cualquiera que hoy
                  tenga conocimiento organizado y gente dispuesta a pagar por él.
                </p>
                <p>
                  La diferencia con «tener los videos subidos» es la experiencia completa: el
                  alumno sabe en qué clase quedó, cuándo se libera la próxima, dónde preguntar y
                  a quién. Esa estructura es exactamente lo que hace que termine el curso, y un
                  alumno que termina es el que vuelve a comprar.
                </p>
              </Prose>
            </section>

            <section id="por-que" className="scroll-mt-24">
              <SectionHead n="02" title="Por qué dejar el marketplace" />
              <Prose>
                <p>
                  Las plataformas masivas de cursos resuelven el primer paso y después se
                  convierten en el techo. Se quedan con una comisión de cada venta para siempre,
                  muestran tu curso al lado de decenas de competidores y empujan descuentos
                  agresivos que erosionan tu precio.
                </p>
                <p>
                  Lo más caro no es la comisión: es que el alumno es de ellas. No tenés su email,
                  no podés avisarle de tu próximo lanzamiento, y la relación que construiste no
                  te pertenece. Cada lanzamiento arranca de cero.
                </p>
                <p>
                  Una academia propia invierte esa ecuación. El costo es fijo y previsible, el
                  precio lo definís vos, y cada alumno que entra se suma a una lista que es tuya.
                  El primer lanzamiento cuesta más trabajo; del segundo en adelante, todo lo que
                  construiste juega a favor.
                </p>
              </Prose>
            </section>

            <section id="piezas" className="scroll-mt-24">
              <SectionHead n="03" title="Las piezas de la academia" />
              <Prose>
                <p>
                  No hace falta arrancar con todo. Lo habitual es empezar con un curso y el cobro
                  funcionando, y sumar comunidad y suscripción cuando ya hay alumnos que
                  sostienen el ritmo.
                </p>
              </Prose>
              <PieceGrid pieces={PIEZAS} />
            </section>

            <section id="beneficios" className="scroll-mt-24">
              <SectionHead n="04" title="Beneficios para tu academia" />
              <Prose>
                <p>
                  Estos son los cambios concretos de pasar de plataformas alquiladas a un sistema
                  propio, ordenados por el impacto que suelen tener.
                </p>
              </Prose>
              <BenefitGrid benefits={BENEFICIOS} />
            </section>

            <IntegrationsSection n="05" />

            <section id="datos" className="scroll-mt-24">
              <SectionHead n="06" title="Los datos detrás del diseño" />
              <Prose>
                <p>
                  La estructura, la comunidad y la velocidad no son decisiones de gusto. Estas
                  son las cifras que explican por qué diseñamos una academia de esta forma y no
                  como una simple lista de videos.
                </p>
              </Prose>
              <StatList stats={DATOS} />
            </section>

            <section id="sistema" className="scroll-mt-24">
              <SectionHead n="07" title="Cómo está construido" />
              <Prose>
                <p>
                  Sin tecnicismos: esto es lo que hace que la academia funcione sola y que puedas
                  operarla sin depender de nadie.
                </p>
              </Prose>
              <NumberedList items={SISTEMA} />
            </section>

            <section id="empezar" className="scroll-mt-24">
              <SectionHead n="08" title="Cómo empezamos" />
              <Prose>
                <p>
                  El punto de partida es lo que ya tenés: quizás un curso grabado, una lista de
                  alumnos de ediciones anteriores o simplemente el temario en la cabeza. Con eso
                  alcanza para definir el alcance.
                </p>
                <p>
                  Nos contás qué enseñás, cómo cobrás hoy y qué parte te está consumiendo más
                  tiempo. Armamos una propuesta concreta, con alcance y precio, en el día.
                </p>
              </Prose>
              <ClosingCta
                title="¿Enseñás y querés dejar de alquilar la plataforma?"
                body="Academias, institutos, profesores independientes, coaches y marcas que forman a sus clientes. Contanos cómo trabajás hoy y te respondemos en el día."
              />
            </section>

            <div>
              <p className="text-[13.5px] leading-relaxed text-white/55">
                ¿Además vendés productos o das sesiones uno a uno? Mirá el{" "}
                <Link
                  href="/modelo-hibrido"
                  className="text-white/85 underline decoration-white/30 underline-offset-2 transition hover:text-white"
                >
                  modelo híbrido
                </Link>
                , que suma tienda y agenda a esta misma base. El caso real está en{" "}
                <a
                  href="https://lareinadebastos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-white/85 underline decoration-white/30 underline-offset-2 transition hover:text-white"
                >
                  La Reina de Bastos
                  <ArrowUpRight className="h-3 w-3" />
                </a>
                .
              </p>
            </div>

            <OtherModels current="/modelo-cursos" />
          </div>
        </div>
      </main>
    </div>
  );
}
