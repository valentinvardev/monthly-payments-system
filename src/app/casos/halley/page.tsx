import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/studio/i18n";
import { PixelBackdrop } from "@/components/studio/PixelBackdrop";
import { TocNav } from "@/components/studio/TocNav";
import {
  BenefitGrid,
  ClosingCta,
  ModelHeader,
  ModelHero,
  NumberedList,
  Prose,
  SectionHead,
  type Benefit,
  type ModelSection,
} from "@/components/studio/model-page";

export const metadata: Metadata = {
  title: "Caso Halley: cobrarle a 2.000 familias sin perseguir a ninguna",
  description:
    "Cómo resolvimos la cobranza en cuotas de una productora de egresados que opera 27 colegios y cerca de 2.000 estudiantes: imputación derivada, dos pasarelas de pago y entrega condicionada al saldo.",
};

const SECTIONS: ModelSection[] = [
  { id: "problema", n: "01", label: "El problema" },
  { id: "sistema", n: "02", label: "Qué se construyó" },
  { id: "decisiones", n: "03", label: "Las decisiones que lo sostienen" },
  { id: "integracion", n: "04", label: "Lo que aparece integrando" },
  { id: "seguridad", n: "05", label: "La auditoría de seguridad" },
  { id: "stack", n: "06", label: "Cómo está construido" },
  { id: "cierre", n: "07", label: "Si tu operación es así" },
];

// Los números de la operación del cliente. Van arriba de todo porque es lo
// que califica al lector: quien gestiona menos de cien pagadores no tiene
// este problema, y quien gestiona miles se reconoce en la primera línea.
const FACTS: { value: string; label: string }[] = [
  { value: "27", label: "colegios" },
  { value: "~2.000", label: "estudiantes" },
  { value: "2", label: "pasarelas de pago" },
  { value: "2-3", label: "años por plan" },
];

const SISTEMA: Benefit[] = [
  {
    title: "Cobros por grupo",
    body: "Un grupo por colegio y promoción, cada uno con su plan de N cuotas. Los alumnos se cargan uno por uno o pegando una lista completa, que es como llega el padrón en la vida real.",
  },
  {
    title: "Dos proveedores, ruteo por grupo",
    body: "Talo, con una transferencia a un CVU propio por alumno, y Mercado Pago con Checkout Pro. Cada grupo se rutea a la cuenta que le corresponde cobrar, sin que nadie tenga que elegir a mano.",
  },
  {
    title: "Una cuenta por socio",
    body: "Cada socio de la productora tiene su cuenta y la plata de cada evento cae donde corresponde. La cuenta de Mercado Pago se vincula con un botón, sin pasar credenciales por mensaje.",
  },
  {
    title: "El lado de la familia",
    body: "Un link personal sin login, o registro con email y panel propio. La familia ve su plan cuota por cuota, paga, y le llega la confirmación. Deja de preguntar cuánto debe porque lo tiene delante.",
  },
  {
    title: "Galerías que se abren solas",
    body: "El material se libera cuando el plan está saldado, con el permiso chequeado en el servidor. No es esconder un botón: es que el archivo no se sirve si la deuda no está en cero.",
  },
  {
    title: "La vitrina pública",
    body: "La landing de la productora, con el portfolio por categoría y pedido de presupuesto por WhatsApp. El mismo sistema que cobra es el que trae al próximo cliente.",
  },
];

const DECISIONES: Benefit[] = [
  {
    title: "El estado de las cuotas no se guarda",
    body: "La tentación es una columna «pagada» por cuota, y es la fuente de todos los desacuerdos: alguien paga de más, alguien paga dos cuotas juntas, alguien transfiere un monto que no coincide con nada, y a partir de ahí el panel dice una cosa y los pagos dicen otra. Acá el estado se deriva: se toma todo lo pagado y se reparte sobre el plan, de la cuota más vieja a la más nueva, con la mora incluida. Un pago parcial, uno de más y dos cuotas juntas se acomodan solos, sin código para cada caso. Y el panel no puede terminar diciendo algo distinto de lo que dicen los pagos, porque no tiene dónde guardarlo.",
  },
  {
    title: "Un cliente particular es un grupo de uno",
    body: "Halley también cobra bodas y quince: un cliente, una seña, un saldo. No son cuotas mensuales y no son un grupo. Se modelaron igual, como un grupo con un solo alumno. Con eso las bodas heredan gratis la imputación, los pagos, las galerías, el panel de la familia y los avisos. Cero lógica nueva para el segundo tipo de negocio.",
  },
  {
    title: "Un aviso de pago no es un pago",
    body: "Los webhooks de Talo y de Mercado Pago se tratan como lo que son: un aviso de que algo pasó. Antes de registrar un peso, el sistema vuelve a consultar el pago contra la API del proveedor con su propio token. Un aviso inventado no puede fabricar plata. Y todo es idempotente por referencia de pago, así que un aviso repetido no cobra dos veces.",
  },
];

const HALLAZGOS: Benefit[] = [
  {
    title: "No hay API key fija",
    body: "La autenticación es un token de una hora que se intercambia por credenciales. El adaptador escrito contra la documentación habría dejado de funcionar a los sesenta minutos.",
  },
  {
    title: "Un Content-Type en un GET devuelve HTTP 500",
    body: "Enviarlo es lo que hace cualquier cliente HTTP por costumbre. Con ese encabezado puesto, ninguna transferencia se habría podido confirmar nunca — y el síntoma habría sido «el sistema no ve los pagos», que se investiga por el lado equivocado durante días.",
  },
  {
    title: "El campo del monto es el neto, no el bruto",
    body: "El campo que parece el monto ya tiene la comisión descontada. Leyéndolo, cada familia habría quedado debiendo la comisión de su propia transferencia: centavos por operación, dos mil familias, y una discusión por cada una.",
  },
  {
    title: "El alias se trunca a 20 caracteres",
    body: "Talo le antepone un prefijo al alias que uno le manda y corta el resto. Los alias construidos con nombre y apellido terminaban colisionando entre dos alumnos del mismo colegio, en un campo que Talo exige único. Se rehízo con un sufijo aleatorio.",
  },
  {
    title: "El CVU y el alias no vienen donde dice la documentación",
    body: "Están anidados un nivel más adentro de lo documentado. Es el más inofensivo de los cinco y aun así habría roto el alta de cada alumno.",
  },
];

const DEFENSAS: Benefit[] = [
  {
    title: "Firma verificada en los webhooks",
    body: "Los avisos de Mercado Pago se validan contra su firma antes de mirarles el contenido. Sumado a la reconsulta contra la API, hacen falta dos cosas para que un aviso cuente, no una.",
  },
  {
    title: "Las credenciales no salen del servidor",
    body: "El panel muestra los últimos cuatro caracteres y nada más. No hay pantalla, endpoint ni export que devuelva una credencial completa.",
  },
  {
    title: "Material privado firmado y con vencimiento corto",
    body: "Las fotos y videos se sirven con URLs firmadas que caducan, y nunca por CDN. Un link filtrado deja de servir solo.",
  },
  {
    title: "Freno de fuerza bruta y bitácora de pagos",
    body: "El panel corta los intentos repetidos, y cada evento de pago queda registrado. En la primera transferencia real, esa bitácora permitió señalar exactamente dónde se había cortado el flujo.",
  },
];

function FactsRow() {
  return (
    <section
      className="reveal mt-10 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/10 sm:grid-cols-4"
      style={{ animationDelay: "80ms" }}
    >
      {FACTS.map((f) => (
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

export default async function CasoHalleyPage() {
  const locale = await getLocale();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-[#fafafa]">
      <PixelBackdrop />
      <ModelHeader locale={locale} sections={SECTIONS} />

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14">
        <ModelHero
          eyebrow="CASO DE CLIENTE · COBRANZA EN CUOTAS"
          titleA="Cobrarle a 2.000 familias"
          titleB="sin perseguir a ninguna."
          intro="Halley Audiovisual filma egresados en Córdoba. Su operación son 27 colegios y cerca de 2.000 estudiantes, cada uno con un plan de cuotas mensuales que arranca dos o tres años antes del viaje. Construimos el sistema que sostiene ese ciclo entero: de la primera cuota a la entrega del material."
        />

        <FactsRow />

        <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
          <TocNav sections={SECTIONS} />

          <div className="min-w-0 space-y-20">
            <section id="problema" className="scroll-mt-24">
              <SectionHead n="01" title="El problema" />
              <Prose>
                <p>
                  Cada mes hay que decirle a dos mil familias cuánto deben, cobrarles por
                  transferencia, mirar el extracto bancario, cruzar cada depósito contra un
                  apellido, anotarlo en una planilla, avisarle al que pagó, perseguir al que no
                  y —cuando el plan termina— entregarle el material a la familia correcta y a
                  nadie más.
                </p>
                <p>
                  <strong className="text-white/85">
                    Nada de eso es difícil. Todo eso es imposible de sostener a mano sin
                    equivocarse.
                  </strong>
                </p>
                <p>
                  Y los errores no son parejos. Cobrarle de menos a una familia es plata perdida.
                  Cobrarle de más es un problema con un cliente. Y entregarle el material a quien
                  todavía debe es perder el único instrumento de cobro que queda.
                </p>
              </Prose>
            </section>

            <section id="sistema" className="scroll-mt-24">
              <SectionHead n="02" title="Qué se construyó" />
              <Prose>
                <p>
                  Un sistema que cubre el ciclo entero, de la primera cuota a la entrega del
                  material. No es un panel de deudores: es la lógica que decide quién debe qué,
                  qué se cobra cuándo y qué se destraba cuando entra la plata.
                </p>
              </Prose>
              <BenefitGrid benefits={SISTEMA} />
            </section>

            <section id="decisiones" className="scroll-mt-24">
              <SectionHead n="03" title="Las decisiones que lo sostienen" />
              <Prose>
                <p>
                  Tres, y las tres son sobre qué <strong className="text-white/85">no</strong>{" "}
                  hacer. Son las que hacen que el sistema siga siendo chico cuando la operación
                  crece.
                </p>
              </Prose>
              <NumberedList items={DECISIONES} />
            </section>

            <section id="integracion" className="scroll-mt-24">
              <SectionHead n="04" title="Lo que sólo aparece integrando de verdad" />
              <Prose>
                <p>
                  La integración con Talo se escribió primero contra la documentación y después se
                  probó contra la API real. Los dos no coincidían. Cinco hallazgos, todos
                  silenciosos, todos encontrados antes de que tocaran a una familia.
                </p>
              </Prose>
              <NumberedList items={HALLAZGOS} />
              <div className="mt-8 rounded-lg border border-white/12 bg-[#0f0f0f] p-6">
                <p className="max-w-[68ch] text-[13.5px] leading-relaxed text-white/65">
                  Ninguno de los cinco se veía en una prueba con datos falsos. Los cinco se
                  arreglaron en el día. Esta es la parte del trabajo que no se puede estimar
                  leyendo una documentación, y la razón por la que conviene integrar temprano, con
                  la plata todavía a salvo.
                </p>
              </div>
            </section>

            <section id="seguridad" className="scroll-mt-24">
              <SectionHead n="05" title="La auditoría de seguridad" />
              <Prose>
                <p>
                  Terminado el sistema se hizo una revisión de punta a punta. Encontró dos puertas
                  abiertas que importaban de verdad, las dos introducidas por herramientas de
                  demostración que en algún momento fueron útiles.
                </p>
                <p>
                  La primera era{" "}
                  <strong className="text-white/85">un simulador de pagos alcanzable desde afuera</strong>
                  , pensado para recorrer el flujo sin plata real y que quedaba habilitado con la
                  configuración que estaba puesta. Se verificó en vivo: era posible llevar una deuda
                  a cero sin transferir un peso, y con eso abrir la galería privada de la familia.
                </p>
                <p>
                  La segunda era{" "}
                  <strong className="text-white/85">
                    una vía de acceso que se conformaba con el email
                  </strong>
                  : según cómo estuviera configurado el entorno, alcanzaba con conocer una
                  dirección de correo para entrar a la cuenta de una familia.
                </p>
                <p>
                  Las dos se cerraron detrás de una sola función que decide si las herramientas de
                  demostración están habilitadas, y que en producción responde que no salvo que se
                  la habilite explícitamente. Una sola puerta es auditable; diez condiciones
                  repartidas por el código no lo son.
                </p>
                <p>
                  La misma auditoría destapó, de paso, que la política de seguridad del navegador
                  —puesta por nosotros unos días antes— estaba bloqueando todas las subidas de
                  archivos. Nadie lo había notado porque el síntoma parecía otro: la vitrina vacía
                  se leía como «todavía no subimos nada».
                </p>
              </Prose>
              <BenefitGrid benefits={DEFENSAS} />
            </section>

            <section id="stack" className="scroll-mt-24">
              <SectionHead n="06" title="Cómo está construido" />
              <Prose>
                <p>
                  Next.js con App Router y TypeScript, tRPC entre el panel y el servidor, Prisma
                  sobre Postgres en Supabase, y el material privado en S3 detrás de CloudFront.
                  Los cobros entran por Talo y Mercado Pago, los avisos salen por Resend, y todo
                  corre con PM2 sobre Debian.
                </p>
                <p>
                  El sistema no es difícil por lo que hace. Es difícil por lo que no puede
                  permitir: que el panel y los pagos digan cosas distintas, que un aviso falso
                  fabrique plata, que el material salga antes de tiempo, que una comisión se cobre
                  dos veces.
                </p>
                <p>
                  Casi todo eso se resolvió sacando cosas. Sacando el estado guardado, sacando el
                  segundo modelo de datos, sacando las condiciones repartidas. Lo que quedó es
                  chico y se puede leer entero.
                </p>
              </Prose>
            </section>

            <section id="cierre" className="scroll-mt-24">
              <SectionHead n="07" title="Si tu operación tiene esta forma" />
              <Prose>
                <p>
                  Colegios, academias, institutos, clubes, escuelas de música o danza, jardines.
                  Si le cobrás a cientos o miles de familias en cuotas, cruzás transferencias
                  contra apellidos en una planilla y tenés algo para entregar que podrías
                  condicionar al pago, el problema es el mismo y la solución también.
                </p>
              </Prose>
              <ClosingCta
                title="¿Cuánto no estás cobrando?"
                body="Contanos cuántos pagadores tenés, cómo cobrás hoy y qué parte se hace a mano. Con eso te decimos qué se puede automatizar primero y cuánto cuesta, en el día."
              />
            </section>

            <section className="mt-20 border-t border-white/10 pt-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                Seguir mirando
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/#proyectos"
                  className="group flex items-center justify-between gap-4 rounded-lg border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                      Otros proyectos
                    </span>
                    <span className="mt-1 block text-[13px] text-white/50">
                      Lo que construimos hasta ahora
                    </span>
                  </span>
                </Link>
                <Link
                  href="/modelo-hibrido"
                  className="group flex items-center justify-between gap-4 rounded-lg border border-white/12 bg-[#0f0f0f] p-5 transition-colors hover:border-white/25"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tracking-[-0.02em] text-white/95">
                      Modelos de negocio
                    </span>
                    <span className="mt-1 block text-[13px] text-white/50">
                      Cómo se arma cada tipo de plataforma
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
