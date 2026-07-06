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
      "Estudio de desarrollo: e-commerce, plataformas para fotógrafos y herramientas con IA. Código preciso, diseño con criterio — desde Sudamérica para donde haga falta.",
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
      "Surcodia nace de dos mundos que parecen competir: la precisión técnica y la sensibilidad estética. Acá conviven. Escribimos código como se compone una foto — con intención. Y diseñamos sistemas que no te piden permiso para trabajar: agentes, automatización, procesos que corren solos mientras dormís.",
    manifestoQuote: "El futuro no se espera. Se programa.",

    contactEyebrow: "04 · CONTACTO",
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
      "A development studio: e-commerce, platforms for photographers and AI-powered tools. Precise code, deliberate design — from South America to wherever it's needed.",
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
      "Surcodia was born from two worlds that seem to compete: technical precision and aesthetic sensibility. Here they coexist. We write code the way a photograph is composed — with intent. And we design systems that don't ask permission to work: agents, automation, processes that run on their own while you sleep.",
    manifestoQuote: "The future isn't waited for. It's programmed.",

    contactEyebrow: "04 · CONTACT",
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
