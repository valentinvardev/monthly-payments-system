import { prisma } from "@/lib/prisma";

// Contenido del estudio leído del schema `personal_site` (mismo Postgres,
// gestionado por el repo personal-website). Este proyecto NUNCA migra esas
// tablas — acceso read-only vía SQL crudo para no meterlas en el schema de
// Prisma de acá (evita que un `db push` de un repo pise al otro).

export type StudioNiche = {
  slug: string;
  name: string;
  nameEn: string | null;
  tagline: string | null;
  taglineEn: string | null;
  icon: string;
  color: string;
};

export type StudioProject = {
  slug: string;
  name: string;
  color: string;
  short: string;
  shortEn: string | null;
  stack: string[];
  liveUrl: string | null;
};

export async function getStudioNiches(): Promise<StudioNiche[]> {
  try {
    return await prisma.$queryRaw<StudioNiche[]>`
      SELECT slug, name, "nameEn", tagline, "taglineEn", icon, color
      FROM personal_site."Niche"
      ORDER BY "sortOrder" ASC
    `;
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(): Promise<StudioProject[]> {
  try {
    return await prisma.$queryRaw<StudioProject[]>`
      SELECT slug, name, color, short, "shortEn", stack, "liveUrl"
      FROM personal_site."Project"
      WHERE featured = true
      ORDER BY "sortOrder" ASC
    `;
  } catch {
    return [];
  }
}

// Acentos Geist compartidos con el sitio personal (Niche.color / Project.color).
export const ACCENT_HEX: Record<string, string> = {
  blue: "#0070F3",
  purple: "#7928CA",
  teal: "#17C9A5",
  green: "#2EA043",
  amber: "#F5A623",
  red: "#E5484D",
  gray: "#8A8A86",
};

// Assets pixel por nicho (generados con scripts/generate-assets.mjs).
// PIXEL_V rompe el caché de Cloudflare/navegador cuando regeneramos un
// asset manteniendo el nombre de archivo — subilo en 1 cada vez.
export const PIXEL_V = "?v=6";

export const NICHE_ART: Record<string, { banner: string; character: string }> = {
  "fotografia-eventos": {
    banner: `/pixel/banner-fotografia.png${PIXEL_V}`,
    character: `/pixel/camara.png${PIXEL_V}`,
  },
  "e-commerce": {
    banner: `/pixel/banner-ecommerce.png${PIXEL_V}`,
    character: `/pixel/changuito.png${PIXEL_V}`,
  },
  "ia-herramientas": {
    banner: `/pixel/banner-ia.png${PIXEL_V}`,
    character: `/pixel/agente.png${PIXEL_V}`,
  },
};
