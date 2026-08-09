// Importa la planilla de prospección a la tabla Prospect.
//
//   npm run prospects:import
//   npm run prospects:import -- otra-planilla.xlsx --dry
//
// Va en TypeScript y corre con tsx porque el generador `prisma-client` de
// Prisma 7 emite el cliente como .ts: desde un .mjs no se puede importar.
//
// Un .xlsx es un zip de XML y fflate ya está en el proyecto, así que no
// hace falta sumar una dependencia solo para leerlo una vez.
//
// Es idempotente por (nombre, zona): correrlo dos veces no duplica nada.
// Actualiza los datos de contacto de los que ya existen, pero NUNCA pisa
// el trabajo hecho — calificación, estado, nota de fricción y fecha de
// contacto se tocan solo si en la base todavía están vacíos. La planilla
// es la fuente del padrón; el dashboard es la fuente del avance.

import { readFileSync } from "node:fs";
import { unzipSync, strFromU8 } from "fflate";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type {
  ProspectChannel,
  ProspectStage,
  ProspectTri,
} from "../src/generated/prisma/enums";

const file = process.argv[2] ?? "prospectos-argentina.xlsx";
const dryRun = process.argv.includes("--dry");

// --- lectura del xlsx -------------------------------------------------

type Row = Record<string, string>;

function readSheet(path: string): Row[] {
  const zip = unzipSync(readFileSync(path));

  let shared: string[] = [];
  if (zip["xl/sharedStrings.xml"]) {
    const ss = strFromU8(zip["xl/sharedStrings.xml"]);
    // [\s\S] en vez del flag `s`: el target del proyecto es ES2017 y dotAll
    // recién existe desde ES2018.
    shared = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
      [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""),
    );
  }

  const decode = (s: string) =>
    s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");

  // Hoja 1 = "Prospectos idiomas". Las otras son panel y documentación.
  const xml = strFromU8(zip["xl/worksheets/sheet1.xml"]);
  const rows: Row[] = [];

  for (const row of xml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: Row = {};
    for (const c of row[2].matchAll(/<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const [, col, attrs, inner] = c;
      const v = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      const inline = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
      let value = "";
      if (/t="s"/.test(attrs) && v != null) value = shared[Number(v)] ?? "";
      else if (/t="inlineStr"/.test(attrs) && inline != null) value = inline;
      else if (v != null) value = v;
      cells[col] = decode(value).trim();
    }
    rows.push(cells);
  }
  return rows;
}

// --- mapeo de la planilla al modelo -----------------------------------

const TRI: Record<string, ProspectTri> = {
  si: "SI",
  sí: "SI",
  no: "NO",
  "no se": "NO_SE",
  "no sé": "NO_SE",
};
const tri = (v?: string): ProspectTri => TRI[(v ?? "").toLowerCase().trim()] ?? "NO_SE";

const STAGE: Record<string, ProspectStage> = {
  "sin contactar": "SIN_CONTACTAR",
  contactado: "CONTACTADO",
  respondio: "RESPONDIO",
  respondió: "RESPONDIO",
  "llamada agendada": "LLAMADA_AGENDADA",
  "propuesta enviada": "PROPUESTA_ENVIADA",
  ganado: "GANADO",
  perdido: "PERDIDO",
  descartado: "DESCARTADO",
};
const stage = (v?: string): ProspectStage =>
  STAGE[(v ?? "").toLowerCase().trim()] ?? "SIN_CONTACTAR";

const CHANNEL: Record<string, ProspectChannel> = {
  email: "EMAIL",
  "instagram dm": "INSTAGRAM_DM",
  telefono: "TELEFONO",
  teléfono: "TELEFONO",
  presencial: "PRESENCIAL",
  referido: "REFERIDO",
};
const channel = (v?: string): ProspectChannel | null =>
  CHANNEL[(v ?? "").toLowerCase().trim()] ?? null;

// Excel guarda las fechas como días desde 1899-12-30.
function excelDate(v?: string): Date | null {
  if (!v) return null;
  const n = Number(v);
  if (Number.isFinite(n) && n > 0) return new Date(Math.round((n - 25569) * 86400 * 1000));
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const clean = (v?: string): string | null => {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
};

// Algunas filas traen un número en la columna Zona: son datos corridos en
// la planilla. Un número no es una zona, así que lo tratamos como faltante
// y lo contamos aparte para poder avisar al final.
const zoneOf = (raw?: string): string | null => {
  const s = clean(raw);
  return s == null || /^\d+$/.test(s) ? null : s;
};

// La columna Prioridad tiene celdas vacías, pero el panel de la planilla
// define prioridad 1 como «CABA / GBA». Cuando falta, la derivamos de la
// zona: así las dos cuentas coinciden en vez de diferir en 7 prospectos.
const priorityOf = (raw: string | undefined, zone: string | null): 1 | 2 => {
  const n = Number(clean(raw));
  if (n === 1 || n === 2) return n;
  return zone != null && /^(caba|gba)\b/i.test(zone) ? 1 : 2;
};

async function main() {
  const rows = readSheet(file);
  if (rows.length < 2) throw new Error(`${file}: no tiene filas de datos`);

  // Fila 1 son los encabezados; mapeamos por nombre y no por letra para
  // que agregar una columna a la izquierda no rompa la importación.
  const header = rows[0];
  const colOf = (needle: string) =>
    Object.keys(header).find((k) =>
      header[k].toLowerCase().includes(needle.toLowerCase()),
    ) ?? "";

  const C = {
    name: colOf("instituto"),
    zone: colOf("zona"),
    email: colOf("email"),
    instagram: colOf("instagram"),
    website: colOf("web"),
    priority: colOf("prioridad"),
    mp: colOf("mercado pago"),
    students: colOf("100 alumnos"),
    monthly: colOf("cobra mensual"),
    stage: colOf("estado"),
    contactedAt: colOf("fecha contacto"),
    channel: colOf("canal"),
    friction: colOf("notas"),
  };

  if (!C.name || !C.zone) {
    throw new Error(
      `No encuentro las columnas Instituto/Zona. Encabezados leídos: ${Object.values(header).join(", ")}`,
    );
  }

  const sinZona: string[] = [];

  const records = rows
    .slice(1)
    .map((r) => {
      const name = clean(r[C.name]);
      const zone = zoneOf(r[C.zone]);
      if (name && zone == null) sinZona.push(name);
      return {
        name,
        zone: zone ?? "Sin zona",
        email: clean(r[C.email]),
        instagram: clean(r[C.instagram]),
        website: clean(r[C.website]),
        priority: priorityOf(r[C.priority], zone),
        usesMercadoPago: tri(r[C.mp]),
        over100Students: tri(r[C.students]),
        chargesMonthly: tri(r[C.monthly]),
        stage: stage(r[C.stage]),
        contactedAt: excelDate(r[C.contactedAt]),
        channel: channel(r[C.channel]),
        frictionNote: clean(r[C.friction]),
      };
    })
    .filter((r): r is typeof r & { name: string } => Boolean(r.name));

  console.log(`${file}: ${records.length} prospectos leídos`);
  console.log(
    `  prioridad 1: ${records.filter((r) => r.priority === 1).length}` +
      `  ·  con email: ${records.filter((r) => r.email).length}` +
      `  ·  califican 3/3: ${
        records.filter(
          (r) =>
            r.usesMercadoPago === "SI" &&
            r.over100Students === "SI" &&
            r.chargesMonthly === "SI",
        ).length
      }`,
  );

  if (sinZona.length) {
    console.log(
      `\n  ⚠ ${sinZona.length} fila(s) sin zona válida (la celda trae un número, los datos` +
        ` están corridos en la planilla). Entran como «Sin zona» y prioridad 2:`,
    );
    sinZona.forEach((n) => console.log(`      ${n}`));
  }

  if (dryRun) {
    console.log("\n--dry: no se escribió nada. Muestra de los primeros 3:");
    for (const r of records.slice(0, 3)) {
      console.log(`  ${r.name} · ${r.zone} · P${r.priority} · ${r.email ?? "sin email"}`);
    }
    return;
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  let creados = 0;
  let actualizados = 0;

  try {
    for (const r of records) {
      const existing = await prisma.prospect.findUnique({
        where: { name_zone: { name: r.name, zone: r.zone } },
        select: {
          id: true,
          usesMercadoPago: true,
          over100Students: true,
          chargesMonthly: true,
          stage: true,
          frictionNote: true,
          contactedAt: true,
        },
      });

      if (!existing) {
        await prisma.prospect.create({ data: r });
        creados++;
        continue;
      }

      // Los datos de contacto se refrescan siempre; el trabajo hecho en el
      // dashboard sólo se completa donde todavía está vacío.
      await prisma.prospect.update({
        where: { id: existing.id },
        data: {
          email: r.email,
          instagram: r.instagram,
          website: r.website,
          priority: r.priority,
          ...(existing.usesMercadoPago === "NO_SE" && { usesMercadoPago: r.usesMercadoPago }),
          ...(existing.over100Students === "NO_SE" && { over100Students: r.over100Students }),
          ...(existing.chargesMonthly === "NO_SE" && { chargesMonthly: r.chargesMonthly }),
          ...(existing.stage === "SIN_CONTACTAR" && { stage: r.stage }),
          ...(existing.frictionNote == null && r.frictionNote && { frictionNote: r.frictionNote }),
          ...(existing.contactedAt == null && r.contactedAt && { contactedAt: r.contactedAt }),
        },
      });
      actualizados++;
    }

    const total = await prisma.prospect.count();
    console.log(`\nListo. ${creados} creados, ${actualizados} actualizados. Total en base: ${total}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("\nFalló la importación:", e.message ?? e);
  process.exit(1);
});
