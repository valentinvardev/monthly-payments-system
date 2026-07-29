import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getLocale } from "@/lib/studio/i18n";
import { StudioBrand } from "@/components/studio/pixel";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { LangToggle } from "@/components/studio/LangToggle";
import { StudioMobileMenu } from "@/components/studio/StudioMobileMenu";
import { TocNav } from "./_components/TocNav";

export const metadata: Metadata = {
  title: "Modelo híbrido: tienda + cursos + membresía",
  description:
    "Cómo funciona una plataforma que vende productos, dicta cursos y sostiene una membresía en un mismo sistema. Análisis, beneficios y caso real: La Reina de Bastos.",
};

const SECTIONS = [
  { id: "que-es", n: "01", label: "Qué es un modelo híbrido" },
  { id: "caso", n: "02", label: "El caso: La Reina de Bastos" },
  { id: "piezas", n: "03", label: "Las cuatro piezas" },
  { id: "beneficios", n: "04", label: "Beneficios para tu negocio" },
  { id: "datos", n: "05", label: "Los datos detrás del diseño" },
  { id: "sistema", n: "06", label: "Cómo está construido" },
  { id: "empezar", n: "07", label: "Cómo empezamos" },
];

const PIEZAS = [
  {
    img: "/pixel/hibrido-tienda.png",
    title: "Tienda",
    body: "Productos físicos, digitales y personalizados en un mismo catálogo. Cada tipo tiene su lógica: el físico maneja stock y envío, el digital se entrega solo al confirmarse el pago, el personalizado abre una conversación antes de producir.",
  },
  {
    img: "/pixel/hibrido-curso.png",
    title: "Cursos",
    body: "Organizados en módulos y lecciones, con liberación programada (el alumno recibe una clase por semana en vez de todo de golpe), clases de muestra gratuitas para que la gente pruebe antes de comprar, y seguimiento de progreso individual.",
  },
  {
    img: "/pixel/hibrido-membresia.png",
    title: "Membresía",
    body: "Una suscripción que destraba todos los cursos y un espacio privado de comunidad con publicaciones y comentarios. Convierte compras sueltas en una relación mensual: ingreso previsible en vez de picos y silencios.",
  },
  {
    img: "/pixel/hibrido-agenda.png",
    title: "Agenda",
    body: "Sesiones uno a uno con reserva online. El cliente elige horario disponible, reserva y paga sin intercambiar mensajes. Vos administrás tu disponibilidad desde el panel y dejás de perder tiempo coordinando por WhatsApp.",
  },
];

const BENEFICIOS = [
  {
    title: "Ingreso previsible, no montaña rusa",
    body: "Vender una vez a mucha gente obliga a empezar de cero cada mes. Una membresía convierte a la misma persona en ingreso recurrente: sabés cuánto entra antes de que arranque el mes y podés planificar producción, compras y contrataciones.",
  },
  {
    title: "Cada línea alimenta a la otra",
    body: "Quien compra un producto descubre el curso; quien termina el curso entra a la membresía; quien está en la comunidad reserva una sesión. Con sistemas separados esos saltos se pierden. En uno solo, cada venta es la puerta de entrada a la siguiente.",
  },
  {
    title: "Valor percibido más alto",
    body: "El mismo contenido dentro de una plataforma propia y cuidada se percibe más valioso que en una carpeta compartida o un grupo de difusión. Eso habilita cobrar más por lo mismo, y reduce el regateo.",
  },
  {
    title: "Tu marca, no la de la plataforma",
    body: "En un marketplace tu curso compite con otros mil y el alumno recuerda la plataforma, no a vos. En sistema propio la tipografía, los colores y el tono son tuyos de punta a punta: la experiencia refuerza tu identidad en vez de diluirla.",
  },
  {
    title: "Profesionalismo que se nota",
    body: "Un checkout que funciona, un email de confirmación que llega, un acceso que se destraba solo. Cada fricción evitada es una objeción menos: el cliente deja de preguntarse si esto es serio y pasa a preguntarse cuándo empieza.",
  },
  {
    title: "Dueño de tus datos y tu relación",
    body: "Los contactos, las compras y el historial son tuyos, exportables. No dependés del alcance de una red social ni de que una plataforma cambie sus reglas o su comisión de un día para el otro.",
  },
  {
    title: "Horas recuperadas todos los meses",
    body: "Cobrar, dar acceso, avisar, coordinar horarios y responder “¿me llegó el pago?” son tareas que se automatizan una vez y no vuelven. Ese tiempo se reinvierte en producir contenido y vender, que es lo que sí necesita ser humano.",
  },
  {
    title: "Preparado para crecer",
    body: "Sumar un curso, una línea de productos o un nivel de membresía es cargar contenido en el panel, no rehacer el sitio. La plataforma acompaña el crecimiento en vez de convertirse en el techo.",
  },
];

const DATOS = [
  {
    stat: "70%",
    label: "de los carritos se abandonan",
    body: "Es el promedio de más de 48 estudios: siete de cada diez compras iniciadas no se terminan. En celular trepa al 85%. La causa número uno declarada son los costos sorpresa al final del proceso. Un checkout claro, con el total visible desde el principio, ataca directamente esa fuga.",
    source: "Baymard Institute",
    href: "https://baymard.com/lists/cart-abandonment-rate",
  },
  {
    stat: "+35%",
    label: "de conversión con mejor checkout",
    body: "El mismo instituto calcula que un sitio promedio puede aumentar su conversión un 35% solo corrigiendo el diseño de su proceso de compra. No es tráfico nuevo ni más publicidad: es la misma gente que ya estaba comprando, terminando de comprar.",
    source: "Baymard Institute",
    href: "https://baymard.com/lists/cart-abandonment-rate",
  },
  {
    stat: "75%",
    label: "juzga tu credibilidad por el diseño",
    body: "Tres de cada cuatro personas admiten evaluar cuán confiable es una empresa a partir del diseño de su sitio. En rubros donde hay dinero de por medio, ese peso sube. El diseño no es decoración: es la primera prueba de que atrás hay alguien serio.",
    source: "Stanford Web Credibility Project",
    href: "https://credibility.stanford.edu/",
  },
  {
    stat: "+8,4%",
    label: "de conversión por cada 0,1s más rápido",
    body: "Un estudio de Google y Deloitte sobre 37 marcas encontró que mejorar una décima de segundo la carga en celular aumentó las conversiones un 8,4% y el ticket promedio un 9,2%. Mismo tráfico, mismo costo de adquisición, más ventas.",
    source: "Google + Deloitte, «Milliseconds Make Millions»",
    href: "https://web.dev/case-studies/milliseconds-make-millions",
  },
  {
    stat: "64%",
    label: "termina el curso con estructura",
    body: "Los cursos con fechas, cohorte y contenido liberado por etapas alcanzan 64% de finalización contra 48% de los cursos totalmente libres. Si además hay comentarios y comunidad, sube a 65,5% frente a 42,6% sin ellos. Un alumno que termina es el que renueva y recomienda.",
    source: "Ruzuku (datos de plataforma)",
    href: "https://www.ruzuku.com/learn/articles/cohort-vs-self-paced",
  },
  {
    stat: "3–5×",
    label: "más valor por cliente con suscripción",
    body: "Un cliente de suscripción genera entre tres y cinco veces más ingresos a lo largo de la relación que uno de compra única, y cerca del 70% de la facturación viene de retener y no de captar. Cuesta mucho menos sostener a alguien que ya te eligió que salir a buscar a alguien nuevo.",
    source: "Swell / benchmarks de subscription commerce",
    href: "https://www.swell.is/content/subscription-commerce-statistics",
  },
];

const SISTEMA = [
  {
    title: "Un solo sistema, no cuatro atados con alambre",
    body: "Tienda, cursos, membresía y agenda comparten la misma base de datos y el mismo login. La clienta entra una vez y encuentra sus compras, sus clases y sus turnos en el mismo lugar. Para vos significa un solo panel y números que cierran entre sí, en vez de exportar planillas de tres servicios distintos.",
  },
  {
    title: "Los permisos se resuelven solos",
    body: "Quién puede ver qué se decide en un único lugar del código: la membresía activa destraba todos los cursos, una compra suelta destraba el suyo, y las clases con fecha futura aparecen recién ese día. Nadie tiene que dar accesos a mano ni recordar a quién le corresponde qué.",
  },
  {
    title: "El pago avisa al sistema, no al revés",
    body: "Cuando Mercado Pago confirma una compra le avisa a la plataforma automáticamente y el acceso se destraba en el momento, aunque la persona haya cerrado la pestaña. Se acaba el «ya te transferí, ¿me habilitás?».",
  },
  {
    title: "Vos cargás el contenido, sin tocar código",
    body: "El panel permite crear productos, armar cursos con sus módulos y lecciones, publicar en la comunidad, gestionar reservas y ver usuarias, órdenes y suscriptores. Cargar un curso nuevo es completar un formulario, no pedir presupuesto por un cambio.",
  },
  {
    title: "La identidad visual se ajusta en vivo",
    body: "Un editor propio permite probar colores, tipografías y fondos sobre el sitio real y ver el resultado al instante, sin equipo técnico en el medio. La marca se afina cuando hace falta, no cuando hay agenda disponible.",
  },
  {
    title: "Rápido porque está armado para eso",
    body: "Las páginas se arman en el servidor y llegan casi listas al navegador: el usuario ve contenido enseguida en vez de una pantalla vacía cargando. Sobre las cifras de velocidad de arriba, esto no es un detalle técnico sino ventas.",
  },
];

export default async function ModeloHibridoPage() {
  const locale = await getLocale();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0a] md:bg-[#0a0a0a]/85 md:backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="min-w-0 transition-opacity hover:opacity-85">
            <StudioBrand />
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
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
            items={SECTIONS.map((s) => ({ href: `#${s.id}`, label: s.label }))}
            locale={locale}
            loginHref="/contanos"
            loginLabel="Contanos tu proyecto"
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14">
        {/* ---------------- HERO ---------------- */}
        <section className="reveal max-w-[62ch]">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
            ANÁLISIS DE SISTEMA · MODELO HÍBRIDO
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-5xl">
            Vender, enseñar y sostener una comunidad{" "}
            <span className="font-light text-white/55">desde un mismo lugar.</span>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/60">
            Muchos negocios ya hacen las tres cosas: venden algo, enseñan algo y tienen gente
            fiel alrededor. El problema casi nunca es el contenido, sino que cada parte vive en
            una herramienta distinta. Esta es la anatomía de una plataforma que las une, contada
            sin tecnicismos y con el respaldo de un caso real que ya está funcionando.
          </p>
        </section>

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          {/* ---------------- ÍNDICE ---------------- */}
          <TocNav sections={SECTIONS} />

          <div className="min-w-0 space-y-20">
            {/* ---------------- 01 ---------------- */}
            <section id="que-es" className="scroll-mt-24">
              <SectionHead n="01" title="Qué es un modelo híbrido" />
              <Prose>
                <p>
                  Un modelo híbrido es un negocio que combina más de una forma de generar
                  ingresos alrededor del mismo conocimiento y la misma audiencia. Una academia
                  que además vende materiales. Una marca de productos que dicta talleres. Un
                  consultorio que suma un programa grabado y sesiones particulares.
                </p>
                <p>
                  Lo que hace especial a este modelo no es la suma de partes, sino cómo se
                  conectan: la persona que compra un producto es candidata natural al curso, y
                  quien termina el curso es candidata natural a la membresía. Cada línea baja el
                  costo de conseguir clientes para la siguiente.
                </p>
                <p>
                  El problema aparece en la ejecución. Lo habitual es resolver la tienda con una
                  plataforma, el curso con otra, los cobros con transferencias sueltas y los
                  turnos por mensajes. La clienta termina con tres contraseñas y vos con cuatro
                  paneles que no se hablan entre sí. Todo el potencial de conexión se pierde
                  justo ahí.
                </p>
              </Prose>
            </section>

            {/* ---------------- 02 ---------------- */}
            <section id="caso" className="scroll-mt-24">
              <SectionHead n="02" title="El caso: La Reina de Bastos" />
              <Prose>
                <p>
                  La Reina de Bastos es una marca espiritual con cuatro líneas conviviendo en una
                  sola plataforma que construimos de cero: tienda de productos, cursos con
                  seguimiento de progreso, sesiones uno a uno con reserva online, y{" "}
                  <strong className="text-white/85">El Círculo</strong>, una membresía que
                  destraba todos los cursos y da acceso a un espacio privado de comunidad.
                </p>
                <p>
                  Todo se administra desde un panel propio: cargar un producto, armar un curso
                  con sus módulos, publicar en la comunidad o revisar las reservas del mes son
                  tareas que la dueña hace sola, sin llamarnos. Es el mismo sistema que
                  proponemos para cualquier negocio con esta forma.
                </p>
              </Prose>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://lareinadebastos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#ededed] px-5 font-pixel text-[10px] text-[#0a0a0a] transition hover:bg-white"
                >
                  Ver la plataforma
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <Link
                  href="/#proyectos"
                  className="inline-flex h-11 items-center justify-center gap-2 border border-white/12 bg-[#161616] px-5 font-pixel text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
                >
                  Otros proyectos
                </Link>
              </div>
            </section>

            {/* ---------------- 03 ---------------- */}
            <section id="piezas" className="scroll-mt-24">
              <SectionHead n="03" title="Las cuatro piezas" />
              <Prose>
                <p>
                  Cada pieza resuelve una forma distinta de cobrar, pero todas comparten los
                  mismos clientes, el mismo carrito y el mismo panel. No hace falta tenerlas
                  todas desde el día uno: se puede empezar por una y sumar el resto cuando el
                  negocio lo pida.
                </p>
              </Prose>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {PIEZAS.map((p) => (
                  <article
                    key={p.title}
                    className="rounded-lg border border-white/12 bg-[#0f0f0f] p-6"
                  >
                    <Image
                      src={p.img}
                      alt=""
                      width={80}
                      height={80}
                      unoptimized
                      className="pixelated"
                    />
                    <h3 className="mt-4 text-base font-semibold tracking-[-0.02em]">{p.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">{p.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* ---------------- 04 ---------------- */}
            <section id="beneficios" className="scroll-mt-24">
              <SectionHead n="04" title="Beneficios para tu negocio" />
              <Prose>
                <p>
                  Estos son los cambios concretos que trae unificar todo en un sistema propio,
                  ordenados por el impacto que suelen tener en el día a día.
                </p>
              </Prose>
              <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/10 sm:grid-cols-2">
                {BENEFICIOS.map((b) => (
                  <article key={b.title} className="bg-[#0f0f0f] p-6">
                    <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                      {b.title}
                    </h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/60">{b.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* ---------------- 05 ---------------- */}
            <section id="datos" className="scroll-mt-24">
              <SectionHead n="05" title="Los datos detrás del diseño" />
              <Prose>
                <p>
                  Cuando insistimos con la velocidad, la claridad del checkout o la estructura de
                  un curso no es capricho estético. Son decisiones con evidencia detrás, y estas
                  son las cifras que más pesan al diseñar un sistema como este.
                </p>
              </Prose>
              <div className="mt-8 space-y-4">
                {DATOS.map((d) => (
                  <article
                    key={d.stat + d.label}
                    className="grid gap-5 rounded-lg border border-white/12 bg-[#0f0f0f] p-6 sm:grid-cols-[140px_1fr]"
                  >
                    <div>
                      <p className="font-display text-3xl font-medium tabular-nums text-[#0070F3]">
                        {d.stat}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/45">
                        {d.label}
                      </p>
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
            </section>

            {/* ---------------- 06 ---------------- */}
            <section id="sistema" className="scroll-mt-24">
              <SectionHead n="06" title="Cómo está construido" />
              <Prose>
                <p>
                  Sin entrar en tecnicismos, esto es lo que hace que el sistema se sostenga solo
                  y que puedas operarlo sin depender de nadie.
                </p>
              </Prose>
              <div className="mt-8 space-y-5">
                {SISTEMA.map((s, i) => (
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
            </section>

            {/* ---------------- 07 ---------------- */}
            <section id="empezar" className="scroll-mt-24">
              <SectionHead n="07" title="Cómo empezamos" />
              <Prose>
                <p>
                  No hace falta tener todo definido ni arrancar con las cuatro piezas. Lo normal
                  es empezar por la que ya te está generando ingresos y sumar el resto cuando el
                  negocio lo pida.
                </p>
                <p>
                  El primer paso es una conversación: nos contás qué vendés hoy, cómo cobrás y
                  qué parte te está consumiendo más tiempo. Con eso armamos una propuesta
                  concreta, con alcance y precio, en el día.
                </p>
              </Prose>
              <div className="mt-8 rounded-lg border border-white/12 bg-[#0f0f0f] p-8">
                <h3 className="font-display text-2xl font-medium tracking-[-0.025em]">
                  ¿Tu negocio tiene esta forma?
                </h3>
                <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-white/60">
                  Academias, marcas con talleres, consultorios con programas, clubes con
                  contenido. Si te reconocés, contanos cómo trabajás y te respondemos en el día.
                </p>
                <Link
                  href="/contanos"
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 bg-[#0070F3] px-6 font-pixel text-[11px] text-white transition hover:bg-[#0060d3]"
                >
                  Contanos tu proyecto
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span className="font-mono text-[11px] tabular-nums text-[#0070F3]">{n}</span>
      <h2 className="font-display text-2xl font-medium tracking-[-0.025em] sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[68ch] space-y-4 text-[14.5px] leading-relaxed text-white/60">
      {children}
    </div>
  );
}
