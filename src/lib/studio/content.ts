import { prisma } from "@/lib/prisma";

// Contenido del estudio leído del schema `personal_site` (mismo Postgres,
// gestionado por el repo personal-website). Este proyecto NUNCA migra esas
// tablas — acceso read-only vía SQL crudo para no meterlas en el schema de
// Prisma de acá (evita que un `db push` de un repo pise al otro).

export type StudioNiche = {
  id: number;
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
  icon: string;
  color: string;
  logoUrl: string | null;
  statusLabel: string;
  statusColor: string;
  short: string;
  shortEn: string | null;
  long: string | null;
  longEn: string | null;
  features: string[];
  featuresEn: string[];
  stack: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  nicheId: number | null;
};

export async function getStudioNiches(): Promise<StudioNiche[]> {
  try {
    return await prisma.$queryRaw<StudioNiche[]>`
      SELECT id, slug, name, "nameEn", tagline, "taglineEn", icon, color
      FROM personal_site."Niche"
      ORDER BY "sortOrder" ASC
    `;
  } catch {
    return [];
  }
}

export async function getAllProjects(): Promise<StudioProject[]> {
  try {
    return await prisma.$queryRaw<StudioProject[]>`
      SELECT slug, name, icon, color, "logoUrl", "statusLabel", "statusColor",
             short, "shortEn", long, "longEn", features, "featuresEn",
             stack, "liveUrl", "repoUrl", featured, "nicheId"
      FROM personal_site."Project"
      ORDER BY featured DESC, "sortOrder" ASC
    `;
  } catch {
    return [];
  }
}

export { ACCENT_HEX } from "./accents";

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
