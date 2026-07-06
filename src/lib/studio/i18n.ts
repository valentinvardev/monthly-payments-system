import { cookies } from "next/headers";

export type Locale = "es" | "en";

export const LOCALE_COOKIE = "studio_lang";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "en" ? "en" : "es";
}

// Landing copy. Keys are shared between locales; `t(locale)` returns the
// full string map so server components read `s.heroTitle` directly.
const STRINGS = {
  es: {
    navNiches: "Nichos",
    navProjects: "Proyectos",
    navContact: "Contacto",
    navClients: "Acceso clientes",
    navPanel: "Mi panel",

    heroEyebrow: "SURCODIA STUDIO · SOFTWARE DEL SUR",
    heroTitleA: "Construimos el software que tu negocio necesita hoy,",
    heroTitleB: "con la mirada puesta en cómo se va a automatizar mañana.",
    heroSub:
      "Desarrollamos soluciones que simplifican y automatizan tus procesos. Menos trabajo manual, más resultados.",
    heroCtaA: "Contanos tu proyecto",
    heroCtaB: "Ver proyectos",

    nichesEyebrow: "01 · NICHOS",
    nichesTitle: "Tres mundos, un mismo estándar.",
    nichesCta: "Ver proyectos",

    projectsEyebrow: "02 · PROYECTOS",
    projectsTitle: "Cosas reales, funcionando en producción.",
    projectsVisit: "Visitar",
    projectsPreview: "Ver preview",
    projectsOpen: "Abrir sitio",
    previewSoon: "Captura próximamente",

    belgranoTag: "CASO REAL · FOTOGRAFÍA DEPORTIVA",
    belgranoTitle: "Vendimos las fotos del campeón de la Liga Argentina.",
    belgranoSub: "Búsqueda por dorsal y reconocimiento facial, para los hinchas y campeones.",
    belgranoPhotosBy: "Fotos:",
    belgranoPlaceholder: "3 FOTOS · PRÓXIMAMENTE",
    belgranoBadge: "COMPRADAS POR LOS JUGADORES",

    stackEyebrow: "CON QUÉ CONSTRUIMOS",

    manifestoEyebrow: "03 · MANIFIESTO",
    manifestoTitle: "Sur + codia.",
    manifestoBody:
      "La mejor tecnología es la que no se nota: sistemas que trabajan solos, procesos que fluyen y herramientas que te devuelven tiempo. Así encaramos cada proyecto, simple por fuera y sólido por dentro.",
    manifestoQuote: "El futuro no se espera. Se programa.",

    aboutEyebrow: "04 · QUIÉN ESTÁ DETRÁS",
    aboutTitle: "Con quién vas a trabajar.",
    aboutP1:
      "Soy Valentín Varela, desarrollador full-stack y diseñador. Surcodia es mi estudio: acá orquesto cada proyecto de punta a punta, de la estrategia de producto al deploy final.",
    aboutP2:
      "Vengo de construir plataformas de fotografía, e-commerce y sistemas de reconocimiento facial. Me obsesiona que las cosas carguen rápido, se sientan claras y sean fáciles de mantener.",
    aboutCta: "Conocé más sobre mí",

    contactEyebrow: "05 · CONTACTO",
    contactTitle: "¿Tenés un proyecto en la cabeza?",
    contactSub: "Contanos qué querés construir y te respondemos en el día.",
    contactCta: "Escribinos",

    footerLogin: "Acceso clientes",
    footerRights: "Hecho en el sur",
  },
  en: {
    navNiches: "Niches",
    navProjects: "Work",
    navContact: "Contact",
    navClients: "Client login",
    navPanel: "My panel",

    heroEyebrow: "SURCODIA STUDIO · SOFTWARE FROM THE SOUTH",
    heroTitleA: "We build the software your business needs today,",
    heroTitleB: "designed for how it will automate itself tomorrow.",
    heroSub:
      "We build solutions that simplify and automate your processes. Less manual work, better results.",
    heroCtaA: "Tell us about your project",
    heroCtaB: "See our work",

    nichesEyebrow: "01 · NICHES",
    nichesTitle: "Three worlds, one standard.",
    nichesCta: "See projects",

    projectsEyebrow: "02 · WORK",
    projectsTitle: "Real things, running in production.",
    projectsVisit: "Visit",
    projectsPreview: "Preview",
    projectsOpen: "Open site",
    previewSoon: "Screenshot coming soon",

    belgranoTag: "REAL CASE · SPORTS PHOTOGRAPHY",
    belgranoTitle: "We sold the photos of the Argentine league champion.",
    belgranoSub: "Bib-number search and facial recognition, for the fans and the champions.",
    belgranoPhotosBy: "Photos:",
    belgranoPlaceholder: "3 PHOTOS · COMING SOON",
    belgranoBadge: "BOUGHT BY THE PLAYERS THEMSELVES",

    stackEyebrow: "WHAT WE BUILD WITH",

    manifestoEyebrow: "03 · MANIFESTO",
    manifestoTitle: "Sur + codia.",
    manifestoBody:
      "The best technology is the kind you don't notice: systems that run on their own, processes that flow, and tools that give you back time. That's how we approach every project, simple on the outside and solid underneath.",
    manifestoQuote: "The future isn't waited for. It's programmed.",

    aboutEyebrow: "04 · WHO'S BEHIND IT",
    aboutTitle: "Who you'll work with.",
    aboutP1:
      "I'm Valentín Varela, a full-stack developer and designer. Surcodia is my studio: I orchestrate every project end to end, from product strategy to the final deploy.",
    aboutP2:
      "I've built photography platforms, e-commerce stores and facial-recognition systems. I'm obsessed with things loading fast, feeling clear and staying easy to maintain.",
    aboutCta: "More about me",

    contactEyebrow: "05 · CONTACT",
    contactTitle: "Got a project in mind?",
    contactSub: "Tell us what you want to build — we reply the same day.",
    contactCta: "Write to us",

    footerLogin: "Client login",
    footerRights: "Made in the south",
  },
} as const;

export type StudioStrings = Record<keyof (typeof STRINGS)["es"], string>;

export function t(locale: Locale): StudioStrings {
  return STRINGS[locale];
}
