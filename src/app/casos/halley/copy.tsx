import type { ReactNode } from "react";
import type { CaseLang } from "@/lib/studio/i18n";
import type { Benefit, ModelSection } from "@/components/studio/model-page";

// Todo el texto del caso Halley, en español y en inglés. La página
// (page.tsx) sólo arma la estructura y elige el idioma. Los párrafos son
// ReactNode para poder resaltar una frase con <S>.

const S = ({ children }: { children: ReactNode }) => (
  <strong className="text-white/85">{children}</strong>
);

type Fact = { value: string; label: string };
type Link = { title: string; hint: string };

export type HalleyCopy = {
  meta: { title: string; description: string };
  toc: string;
  sections: ModelSection[];
  hero: { eyebrow: string; titleA: string; titleB: string; intro: string };
  facts: Fact[];
  problem: { title: string; body: ReactNode[] };
  system: { title: string; intro: ReactNode[]; items: Benefit[] };
  fit: { title: string; body: ReactNode[]; ctaTitle: string; ctaBody: string };
  divider: { eyebrow: string; body: string };
  decisions: { title: string; intro: ReactNode[]; items: Benefit[] };
  integration: { title: string; intro: ReactNode[]; items: Benefit[]; note: string };
  security: { title: string; body: ReactNode[]; items: Benefit[] };
  stack: { title: string; body: ReactNode[] };
  seeAlso: { heading: string; others: Link; sibling: Link };
};

// La página está partida en dos mitades. Las secciones 01-03 son para quien
// tiene el problema (administración, cobranzas) y cierran con el CTA, para
// que ese lector no tenga que atravesar el detalle técnico para llegar a
// pedir el diagnóstico. Las 04-07 son la prueba de profundidad, para quien
// quiera ver cómo está hecho antes de confiar su cobranza.
//
// Los números de la operación del cliente van arriba de todo porque son lo
// que califica al lector: quien gestiona menos de cien pagadores no tiene
// este problema, y quien gestiona miles se reconoce en la primera línea.

const es: HalleyCopy = {
  meta: {
    title: "Caso Halley: cobrarle a 2.000 familias sin perseguir a ninguna",
    description:
      "Cómo construí el sistema de cobranza en cuotas de una productora de egresados que opera 27 colegios y cerca de 2.000 estudiantes: imputación derivada, dos pasarelas de pago y entrega condicionada al saldo.",
  },
  toc: "Índice",
  sections: [
    { id: "problema", n: "01", label: "El problema" },
    { id: "sistema", n: "02", label: "Qué se construyó" },
    { id: "cierre", n: "03", label: "Si tu operación es así" },
    { id: "decisiones", n: "04", label: "Las decisiones que lo sostienen" },
    { id: "integracion", n: "05", label: "Lo que aparece integrando" },
    { id: "seguridad", n: "06", label: "La auditoría de seguridad" },
    { id: "stack", n: "07", label: "Cómo está construido" },
  ],
  hero: {
    eyebrow: "CASO DE CLIENTE · COBRANZA EN CUOTAS",
    titleA: "Cobrarle a 2.000 familias",
    titleB: "sin perseguir a ninguna.",
    intro:
      "Halley Audiovisual filma egresados en Córdoba. Su operación son 27 colegios y cerca de 2.000 estudiantes, cada uno con un plan de cuotas mensuales que arranca dos o tres años antes del evento. Construí el sistema que sostiene ese ciclo entero: de la primera cuota a la entrega del material.",
  },
  facts: [
    { value: "27", label: "colegios" },
    { value: "~2.000", label: "estudiantes" },
    { value: "2", label: "pasarelas de pago" },
    { value: "2-3", label: "años por plan" },
  ],
  problem: {
    title: "El problema",
    body: [
      "Cada mes hay que decirle a dos mil familias cuánto deben, cobrarles por transferencia, mirar el extracto bancario, cruzar cada depósito contra un apellido, anotarlo en una planilla, avisarle al que pagó, perseguir al que no y, cuando el plan termina, entregarle el material a la familia correcta y a nadie más.",
      <S key="s">
        Nada de eso es difícil. Todo eso es imposible de sostener a mano sin equivocarse.
      </S>,
      "Y los errores no son parejos. Cobrarle de menos a una familia es plata perdida. Cobrarle de más es un problema con un cliente. Y entregarle el material a quien todavía debe es perder el único instrumento de cobro que queda.",
    ],
  },
  system: {
    title: "Qué se construyó",
    intro: [
      "Un sistema que cubre el ciclo entero, de la primera cuota a la entrega del material. No es un panel de deudores: es la lógica que decide quién debe qué, qué se cobra cuándo y qué se destraba cuando entra la plata.",
    ],
    items: [
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
    ],
  },
  fit: {
    title: "Si tu operación tiene esta forma",
    body: [
      "Colegios, academias, institutos, clubes, escuelas de música o danza, jardines. Si le cobrás a cientos o miles de familias en cuotas, cruzás transferencias contra apellidos en una planilla y tenés algo para entregar que podrías condicionar al pago, el problema es el mismo y la solución también.",
    ],
    ctaTitle: "¿Cuánto no estás cobrando?",
    ctaBody:
      "Contame cuántos pagadores tenés, cómo cobrás hoy y qué parte se hace a mano. Con eso preparo el diagnóstico: una reunión y tres mejoras con impacto, empezando por la cobranza. Te respondo en el día.",
  },
  divider: {
    eyebrow: "El detalle técnico",
    body: "Hasta acá, qué resuelve el sistema. De acá en adelante, cómo está hecho: las decisiones de diseño que lo sostienen, lo que apareció recién al integrar contra las APIs reales y la auditoría de seguridad. Si no es lo tuyo, ya tenés la película completa.",
  },
  decisions: {
    title: "Las decisiones que lo sostienen",
    intro: [
      <>
        Tres, y las tres son sobre qué <S>no</S> hacer. Son las que hacen que el sistema siga
        siendo chico cuando la operación crece.
      </>,
    ],
    items: [
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
    ],
  },
  integration: {
    title: "Lo que sólo aparece integrando de verdad",
    intro: [
      "La integración con Talo se escribió primero contra la documentación y después se probó contra la API real. Los dos no coincidían. Cinco hallazgos, todos silenciosos, todos encontrados antes de que tocaran a una familia.",
    ],
    items: [
      {
        title: "No hay API key fija",
        body: "La autenticación es un token de una hora que se intercambia por credenciales. El adaptador escrito contra la documentación habría dejado de funcionar a los sesenta minutos.",
      },
      {
        title: "Un Content-Type en un GET devuelve HTTP 500",
        body: "Enviarlo es lo que hace cualquier cliente HTTP por costumbre. Con ese encabezado puesto, ninguna transferencia se habría podido confirmar nunca, y el síntoma habría sido «el sistema no ve los pagos», que se investiga por el lado equivocado durante días.",
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
    ],
    note: "Ninguno de los cinco se veía en una prueba con datos falsos. Los cinco se arreglaron en el día. Esta es la parte del trabajo que no se puede estimar leyendo una documentación, y la razón por la que conviene integrar temprano, con la plata todavía a salvo.",
  },
  security: {
    title: "La auditoría de seguridad",
    body: [
      "Terminado el sistema se hizo una revisión de punta a punta. Encontró dos puertas abiertas que importaban de verdad, las dos introducidas por herramientas de demostración que en algún momento fueron útiles.",
      <>
        La primera era <S>un simulador de pagos alcanzable desde afuera</S>, pensado para recorrer
        el flujo sin plata real y que quedaba habilitado con la configuración que estaba puesta. Se
        verificó en vivo: era posible llevar una deuda a cero sin transferir un peso, y con eso
        abrir la galería privada de la familia.
      </>,
      <>
        La segunda era <S>una vía de acceso que se conformaba con el email</S>: según cómo
        estuviera configurado el entorno, alcanzaba con conocer una dirección de correo para entrar
        a la cuenta de una familia.
      </>,
      "Las dos se cerraron detrás de una sola función que decide si las herramientas de demostración están habilitadas, y que en producción responde que no salvo que se la habilite explícitamente. Una sola puerta es auditable; diez condiciones repartidas por el código no lo son.",
      "La misma auditoría destapó, de paso, que la política de seguridad del navegador, puesta por mí unos días antes, estaba bloqueando todas las subidas de archivos. Nadie lo había notado porque el síntoma parecía otro: la vitrina vacía se leía como «todavía no subimos nada».",
    ],
    items: [
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
    ],
  },
  stack: {
    title: "Cómo está construido",
    body: [
      "Next.js con App Router y TypeScript, tRPC entre el panel y el servidor, Prisma sobre Postgres en Supabase, y el material privado en S3 detrás de CloudFront. Los cobros entran por Talo y Mercado Pago, los avisos salen por Resend, y todo corre con PM2 sobre Debian.",
      "El sistema no es difícil por lo que hace. Es difícil por lo que no puede permitir: que el panel y los pagos digan cosas distintas, que un aviso falso fabrique plata, que el material salga antes de tiempo, que una comisión se cobre dos veces.",
      "Casi todo eso se resolvió sacando cosas. Sacando el estado guardado, sacando el segundo modelo de datos, sacando las condiciones repartidas. Lo que quedó es chico y se puede leer entero.",
    ],
  },
  seeAlso: {
    heading: "Seguir mirando",
    others: { title: "Otros productos", hint: "Lo que construí de punta a punta" },
    sibling: { title: "Caso Stealth Seller", hint: "Product engineering para revendedores de Amazon" },
  },
};

const en: HalleyCopy = {
  meta: {
    title: "Halley case: collecting from 2,000 families without chasing any of them",
    description:
      "How I built the instalment collection system for a graduation video producer working with 27 schools and about 2,000 students: derived payment allocation, two payment gateways and delivery tied to the balance.",
  },
  toc: "Contents",
  sections: [
    { id: "problema", n: "01", label: "The problem" },
    { id: "sistema", n: "02", label: "What I built" },
    { id: "cierre", n: "03", label: "If your operation looks like this" },
    { id: "decisiones", n: "04", label: "The decisions behind it" },
    { id: "integracion", n: "05", label: "What integrating turned up" },
    { id: "seguridad", n: "06", label: "The security audit" },
    { id: "stack", n: "07", label: "How it is built" },
  ],
  hero: {
    eyebrow: "CLIENT CASE · INSTALMENT COLLECTIONS",
    titleA: "Collecting from 2,000 families",
    titleB: "without chasing any of them.",
    intro:
      "Halley Audiovisual films graduating classes in Córdoba, Argentina. Its operation is 27 schools and about 2,000 students, each on a plan of monthly instalments that starts two or three years before the event. I built the system that carries that whole cycle, from the first instalment to the delivery of the photos and videos.",
  },
  facts: [
    { value: "27", label: "schools" },
    { value: "~2,000", label: "students" },
    { value: "2", label: "payment gateways" },
    { value: "2-3", label: "years per plan" },
  ],
  problem: {
    title: "The problem",
    body: [
      "Every month someone has to tell two thousand families how much they owe, collect by bank transfer, go through the bank statement, match each deposit to a surname, log it in a spreadsheet, let the payer know, chase whoever did not pay and, when the plan ends, deliver the photos and videos to the right family and no one else.",
      <S key="s">None of that is hard. All of it is impossible to keep up by hand without mistakes.</S>,
      "And the mistakes are not equal. Undercharging a family is money lost. Overcharging is a problem with a client. And delivering the material to someone who still owes gives away the only leverage left to collect.",
    ],
  },
  system: {
    title: "What I built",
    intro: [
      "A system that covers the whole cycle, from the first instalment to the delivery of the material. It is not a list of debtors: it is the logic that decides who owes what, what gets charged when, and what unlocks when the money comes in.",
    ],
    items: [
      {
        title: "Collections by group",
        body: "One group per school and graduating class, each with its own plan of N instalments. Students are added one by one or by pasting a whole list, which is how the roster actually arrives.",
      },
      {
        title: "Two providers, routed by group",
        body: "Talo, with a bank transfer to a dedicated CVU (an Argentine virtual account number) for each student, and Mercado Pago with Checkout Pro. Each group is routed to the account that should collect it, without anyone choosing by hand.",
      },
      {
        title: "One account per partner",
        body: "Each partner in the business has their own account, and the money from each event lands where it belongs. The Mercado Pago account is linked with a button, without sending credentials over chat.",
      },
      {
        title: "The family's side",
        body: "A personal link with no login, or sign-up with an email and a dashboard of their own. The family sees its plan instalment by instalment, pays, and gets the confirmation. They stop asking how much they owe because it is right in front of them.",
      },
      {
        title: "Galleries that unlock themselves",
        body: "The photos and videos are released once the plan is paid off, with the permission checked on the server. It is not a hidden button: the file is not served unless the balance is zero.",
      },
      {
        title: "The public storefront",
        body: "The producer's landing page, with the portfolio by category and quote requests over WhatsApp. The same system that collects the money brings in the next client.",
      },
    ],
  },
  fit: {
    title: "If your operation looks like this",
    body: [
      "Schools, academies, institutes, clubs, music or dance schools, kindergartens. If you collect from hundreds or thousands of families in instalments, match transfers to surnames in a spreadsheet and have something to deliver that you could tie to payment, the problem is the same and so is the solution.",
    ],
    ctaTitle: "How much are you not collecting?",
    ctaBody:
      "Tell me how many payers you have, how you collect today and which part is done by hand. With that I prepare the diagnosis: one meeting and three improvements with real impact, starting with collections. I reply the same day.",
  },
  divider: {
    eyebrow: "The technical detail",
    body: "Up to here, what the system solves. From here on, how it is built: the design decisions behind it, what only showed up when integrating against the real APIs, and the security audit. If that is not your thing, you already have the whole story.",
  },
  decisions: {
    title: "The decisions behind it",
    intro: [
      <>
        Three, and all three are about what <S>not</S> to do. They are what keeps the system small
        as the operation grows.
      </>,
    ],
    items: [
      {
        title: "Instalment status is not stored",
        body: "The temptation is a “paid” column per instalment, and it is the source of every disagreement: someone overpays, someone pays two instalments at once, someone transfers an amount that matches nothing, and from then on the dashboard says one thing and the payments say another. Here the status is derived: everything paid is spread over the plan, oldest instalment first, late fees included. A partial payment, an overpayment and two instalments at once all sort themselves out, with no code for each case. And the dashboard cannot end up saying something different from the payments, because it has nowhere to store it.",
      },
      {
        title: "A private client is a group of one",
        body: "Halley also films weddings and quinceañeras: one client, a deposit, a balance. They are not monthly instalments and they are not a group. They were modelled the same way, as a group with a single student. That gave weddings the payment allocation, the payments, the galleries, the family dashboard and the notifications for free. Zero new logic for the second line of business.",
      },
      {
        title: "A payment notice is not a payment",
        body: "The Talo and Mercado Pago webhooks are treated as what they are: a notice that something happened. Before recording a single peso, the system checks the payment again against the provider's API with its own token. A forged notice cannot create money. And everything is idempotent by payment reference, so a repeated notice does not charge twice.",
      },
    ],
  },
  integration: {
    title: "What only shows up in a real integration",
    intro: [
      "The Talo integration was written against the documentation first and then tested against the real API. The two did not match. Five findings, all silent, all caught before they touched a family.",
    ],
    items: [
      {
        title: "There is no fixed API key",
        body: "Authentication is a one-hour token exchanged for credentials. The adapter written from the documentation would have stopped working after sixty minutes.",
      },
      {
        title: "A Content-Type header on a GET returns HTTP 500",
        body: "Every HTTP client sends it out of habit. With that header set, no transfer could ever have been confirmed, and the symptom would have been “the system doesn't see the payments”, which gets investigated from the wrong end for days.",
      },
      {
        title: "The amount field is net, not gross",
        body: "The field that looks like the amount already has the fee taken off. Reading it, every family would have ended up owing the fee on their own transfer: cents per payment, two thousand families, and an argument with each one.",
      },
      {
        title: "The alias is cut to 20 characters",
        body: "Talo adds a prefix to the alias you send and cuts off the rest. Aliases built from first and last names ended up colliding between two students at the same school, in a field Talo requires to be unique. It was rebuilt with a random suffix.",
      },
      {
        title: "The CVU and alias are not where the documentation says",
        body: "They sit one level deeper than documented. It is the most harmless of the five, and it still would have broken the sign-up of every student.",
      },
    ],
    note: "None of the five showed up in a test with fake data. All five were fixed the same day. This is the part of the work you cannot estimate by reading documentation, and the reason to integrate early, while the money is still safe.",
  },
  security: {
    title: "The security audit",
    body: [
      "Once the system was done, it got an end-to-end review. It found two open doors that really mattered, both introduced by demo tools that had been useful at some point.",
      <>
        The first was <S>a payment simulator reachable from outside</S>, meant for walking through
        the flow without real money and left enabled by the configuration in place. It was
        verified live: a debt could be brought to zero without transferring a peso, and that opened
        the family&apos;s private gallery.
      </>,
      <>
        The second was <S>a way in that only asked for an email</S>: depending on how the
        environment was configured, knowing an email address was enough to get into a
        family&apos;s account.
      </>,
      "Both were closed behind a single function that decides whether the demo tools are enabled, and that says no in production unless they are explicitly turned on. One door can be audited; ten conditions spread through the code cannot.",
      "The same audit also revealed that the browser security policy, which I had set a few days earlier, was blocking every file upload. Nobody had noticed because the symptom looked like something else: the empty storefront read as “we haven't uploaded anything yet”.",
    ],
    items: [
      {
        title: "Verified webhook signatures",
        body: "Mercado Pago notices are checked against their signature before their content is read. Together with the second check against the API, a notice needs two things to count, not one.",
      },
      {
        title: "Credentials never leave the server",
        body: "The dashboard shows the last four characters and nothing more. No screen, endpoint or export returns a full credential.",
      },
      {
        title: "Private files, signed and short-lived",
        body: "Photos and videos are served through signed URLs that expire, never through the CDN. A leaked link stops working on its own.",
      },
      {
        title: "Brute-force limits and a payment log",
        body: "The dashboard cuts off repeated attempts, and every payment event is logged. On the first real transfer, that log pinpointed exactly where the flow had broken.",
      },
    ],
  },
  stack: {
    title: "How it is built",
    body: [
      "Next.js with the App Router and TypeScript, tRPC between the dashboard and the server, Prisma on Postgres in Supabase, and the private material in S3 behind CloudFront. Payments come in through Talo and Mercado Pago, notifications go out through Resend, and everything runs with PM2 on Debian.",
      "The system is not hard because of what it does. It is hard because of what it cannot allow: the dashboard and the payments saying different things, a fake notice creating money, the material going out early, a fee being charged twice.",
      "Almost all of that was solved by taking things out. Taking out the stored status, taking out the second data model, taking out the scattered conditions. What is left is small and can be read end to end.",
    ],
  },
  seeAlso: {
    heading: "Keep reading",
    others: { title: "Other products", hint: "Things I built end to end" },
    sibling: { title: "Stealth Seller case", hint: "Product engineering for Amazon resellers" },
  },
};

export const HALLEY: Record<CaseLang, HalleyCopy> = { es, en };
