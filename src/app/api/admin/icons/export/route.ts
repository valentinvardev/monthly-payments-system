import { NextResponse } from "next/server";
import { zipSync } from "fflate";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Descarga todos los íconos generados como un único .zip.
// Los PNG se traen desde el bucket público de Supabase en el servidor
// (sin CORS de por medio) y se comprimen con fflate.
export const maxDuration = 60;

function safeName(label: string) {
  return (
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "icono"
  );
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const icons = await prisma.generatedIcon.findMany({
    orderBy: { createdAt: "asc" },
  });
  if (icons.length === 0) {
    return NextResponse.json({ error: "Todavía no hay íconos generados" }, { status: 404 });
  }

  // Los PNG ya están comprimidos: guardamos sin recomprimir (level 0),
  // que es mucho más rápido y pesa prácticamente lo mismo.
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  const used = new Set<string>();

  const downloads = await Promise.all(
    icons.map(async (icon) => {
      try {
        const res = await fetch(icon.url, { cache: "no-store" });
        if (!res.ok) return null;
        return { icon, bytes: new Uint8Array(await res.arrayBuffer()) };
      } catch {
        return null;
      }
    }),
  );

  for (const d of downloads) {
    if (!d) continue;
    const base = safeName(d.icon.label);
    let name = `${base}.png`;
    let i = 2;
    while (used.has(name)) name = `${base}-${i++}.png`;
    used.add(name);
    files[name] = [d.bytes, { level: 0 }];
  }

  if (Object.keys(files).length === 0) {
    return NextResponse.json({ error: "No pudimos descargar ningún ícono" }, { status: 502 });
  }

  // Índice con el prompt de cada ícono, para poder reproducir estilos.
  const manifest = icons
    .map((i) => `${safeName(i.label)}.png\n  ${i.prompt}\n`)
    .join("\n");
  files["prompts.txt"] = [new TextEncoder().encode(manifest), { level: 0 }];

  const zip = zipSync(files);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(zip as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="surcodia-iconos-${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
