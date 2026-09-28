import type { ReactNode } from "react";
import type { CaseLang } from "@/lib/studio/i18n";
import type { Benefit, ModelSection } from "@/components/studio/model-page";

// Todo el texto del caso Stealth Seller, en español y en inglés.
//
// Lo que se cuenta del producto sale de lo que Stealth Seller publica en
// stealthseller.co. Nada de métricas internas, clientes ni nombres: la
// página habla del producto público y del trabajo de Valentín.

const S = ({ children }: { children: ReactNode }) => (
  <strong className="text-white/85">{children}</strong>
);

type Link = { title: string; hint: string };

export type StealthCopy = {
  meta: { title: string; description: string };
  toc: string;
  sections: ModelSection[];
  hero: { eyebrow: string; titleA: string; titleB: string; intro: string };
  visit: string;
  market: { title: string; body: ReactNode[] };
  product: { title: string; intro: ReactNode[]; items: Benefit[] };
  work: { title: string; body: ReactNode[]; items: Benefit[] };
  yours: { title: string; body: ReactNode[]; ctaTitle: string; ctaBody: string };
  seeAlso: { heading: string; sibling: Link; others: Link };
  disclaimer: string;
};

const es: StealthCopy = {
  meta: {
    title: "Stealth Seller: product engineering",
    description:
      "Cómo trabajo como product engineer en Stealth Seller, la plataforma de investigación de productos para revendedores de Amazon: entender cómo decide el usuario y construir rápido con agentes de IA.",
  },
  toc: "Índice",
  sections: [
    { id: "mercado", n: "01", label: "El mercado" },
    { id: "producto", n: "02", label: "Qué hace el producto" },
    { id: "trabajo", n: "03", label: "Mi trabajo ahí" },
    { id: "tu-empresa", n: "04", label: "Lo mismo, en tu empresa" },
  ],
  hero: {
    eyebrow: "CASO · PRODUCT ENGINEERING",
    titleA: "Construir al ritmo",
    titleB: "de lo que piden los usuarios.",
    intro:
      "Stealth Seller es una plataforma de investigación de productos para revendedores de Amazon: calcula fees, ganancia, ROI y costo máximo de cada publicación, vigila las tiendas de otros vendedores y confirma si hay stock en los retailers. Trabajo ahí como product engineer.",
  },
  visit: "Visitar stealthseller.co",
  market: {
    title: "El mercado",
    body: [
      "Revender en Amazon es arbitraje: comprar barato en un retailer y vender más caro en Amazon. Lo difícil no es vender. Es decidir qué comprar, porque un producto rentable hoy puede estar saturado de vendedores cuando llega la mercadería.",
      <>
        Hace años que hay herramientas para decidirlo.{" "}
        <S>La diferencia no está en tener más funciones.</S> Está en entender mejor que nadie cómo
        decide el usuario y llegar antes con lo que le falta.
      </>,
    ],
  },
  product: {
    title: "Qué hace el producto",
    intro: [
      "Todo el camino, de encontrar un producto a comprarlo, en un mismo lugar. Cada pieza responde a una pregunta que el revendedor se hace antes de poner plata.",
    ],
    items: [
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
    ],
  },
  work: {
    title: "Mi trabajo ahí",
    body: [
      "Un product engineer está entre el usuario y el código. El trabajo no empieza en el editor: empieza en cómo decide un revendedor. Qué mira primero, qué dato le hace descartar un producto en segundos, qué le falta para comprar tranquilo.",
      "Con eso se decide qué construir, y se construye rápido: llegar primero con lo que el usuario pide es la ventaja.",
    ],
    items: [
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
    ],
  },
  yours: {
    title: "Lo mismo, en tu empresa",
    body: [
      "SurCodia es este mismo método aplicado a tu operación: entender cómo se trabaja de verdad, encontrar el paso donde se pierde tiempo o plata, y construir la solución rápido, midiendo el antes y el después.",
    ],
    ctaTitle: "¿Dónde se traba tu operación?",
    ctaBody: "Pedí el diagnóstico: una reunión y tres mejoras con impacto. Te respondo en el día.",
  },
  seeAlso: {
    heading: "Seguir mirando",
    sibling: { title: "Caso Halley Audiovisual", hint: "Cobranza en cuotas para 2.000 familias" },
    others: { title: "Otros productos", hint: "Lo que construí de punta a punta" },
  },
  disclaimer:
    "Stealth Seller y su logo son marcas de sus dueños. Esta página cuenta mi trabajo como product engineer ahí. No es una publicación oficial de Stealth Seller, y Stealth Seller no respalda los servicios de SurCodia.",
};

const en: StealthCopy = {
  meta: {
    title: "Stealth Seller: product engineering",
    description:
      "How I work as a product engineer at Stealth Seller, the product research platform for Amazon resellers: understanding how users decide and building fast with AI agents.",
  },
  toc: "Contents",
  sections: [
    { id: "mercado", n: "01", label: "The market" },
    { id: "producto", n: "02", label: "What the product does" },
    { id: "trabajo", n: "03", label: "My work there" },
    { id: "tu-empresa", n: "04", label: "The same, in your company" },
  ],
  hero: {
    eyebrow: "CASE · PRODUCT ENGINEERING",
    titleA: "Building at the pace",
    titleB: "users ask for.",
    intro:
      "Stealth Seller is a product research platform for Amazon resellers: it works out the fees, profit, ROI and maximum cost of each listing, tracks other sellers' storefronts and checks whether retailers have stock. I work there as a product engineer.",
  },
  visit: "Visit stealthseller.co",
  market: {
    title: "The market",
    body: [
      "Reselling on Amazon is arbitrage: buy low at a retailer and sell higher on Amazon. Selling is not the hard part. Deciding what to buy is, because a product that is profitable today can be crowded with sellers by the time the stock arrives.",
      <>
        Tools to decide that have existed for years.{" "}
        <S>The difference is not having more features.</S> It is understanding better than anyone
        how the user decides, and getting there first with what they are missing.
      </>,
    ],
  },
  product: {
    title: "What the product does",
    intro: [
      "The whole path, from finding a product to buying it, in one place. Each piece answers a question the reseller asks before putting money down.",
    ],
    items: [
      {
        title: "AI profit calculator",
        body: "Amazon fees, profit, ROI and maximum cost for a listing, on the spot. It is the number that decides whether a product is worth buying.",
      },
      {
        title: "Tracked sellers",
        body: "Follow up to 600 other sellers' storefronts and get an alert when they list something new. It is a hint of what the people already selling are buying.",
      },
      {
        title: "Retailer stock",
        body: "Checks whether the product is available at the store it would be bought from, before spending time analysing it.",
      },
      {
        title: "AI search",
        body: "Finds the product across retail stores without searching each one by hand.",
      },
      {
        title: "Chrome extension",
        body: "The numbers show up on the Amazon page itself. No switching tabs, no copying anything.",
      },
      {
        title: "Folders",
        body: "What is worth it stays saved and organised, ready for the buying decision.",
      },
    ],
  },
  work: {
    title: "My work there",
    body: [
      "A product engineer sits between the user and the code. The work does not start in the editor: it starts with how a reseller decides. What they look at first, which data point makes them drop a product in seconds, what they need to buy with confidence.",
      "That decides what to build, and it gets built fast: getting there first with what the user asks for is the advantage.",
    ],
    items: [
      {
        title: "The decision before the feature",
        body: "Every new feature answers a step in how the reseller decides. If you cannot say which step it speeds up or which risk it lowers, it is not a priority.",
      },
      {
        title: "Measure before building",
        body: "What people use, where they drop off, what they ask support. When two of those sources say the same thing, that gets built first.",
      },
      {
        title: "Fast, with AI and with judgement",
        body: "AI agents in the development workflow, to go from conversation to production in days. AI brings the speed. It does not bring the judgement about what to build.",
      },
      {
        title: "Ship small, then adjust",
        body: "Every feature ships in the smallest version that already works. What people do with it decides the next round.",
      },
    ],
  },
  yours: {
    title: "The same, in your company",
    body: [
      "SurCodia is this same method applied to your operation: understanding how the work really gets done, finding the step where time or money is lost, and building the fix fast, measuring before and after.",
    ],
    ctaTitle: "Where does your operation get stuck?",
    ctaBody:
      "Request the diagnosis: one meeting and three improvements with real impact. I reply the same day.",
  },
  seeAlso: {
    heading: "Keep reading",
    sibling: { title: "Halley Audiovisual case", hint: "Instalment collections for 2,000 families" },
    others: { title: "Other products", hint: "Things I built end to end" },
  },
  disclaimer:
    "Stealth Seller and its logo are trademarks of their owners. This page describes my work there as a product engineer. It is not an official Stealth Seller publication, and Stealth Seller does not endorse SurCodia's services.",
};

export const STEALTH: Record<CaseLang, StealthCopy> = { es, en };
