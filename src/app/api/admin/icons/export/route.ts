import { NextResponse } from "next/server";
import { Zip, ZipPassThrough } from "fflate";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Descarga todos los íconos generados como un único .zip.
// Los PNG se traen desde el bucket público de Supabase en el servidor
// (sin CORS de por medio) y se comprimen con fflate.
//
// El zip se arma en streaming. Antes bajábamos TODOS los PNG con un
// Promise.all y después zipSync() armaba el archivo entero en memoria: el
// pico era ~2x el peso de la galería, sin techo, y encima zipSync bloquea
// el event loop (en el VPS eso congela el resto de las requests). Ahora
// bajamos con una ventana acotada y emitimos cada entrada apenas está
// lista, respetando el backpressure del cliente.
export const maxDuration = 60;

// Techo duro: sin esto la query crecía sin límite junto con la galería.
const MAX_ICONS = 2000;
// Cuántos PNG tenemos en vuelo a la vez. Acota la memoria residente.
const DOWNLOAD_WINDOW = 4;

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
    select: { label: true, prompt: true, url: true },
    take: MAX_ICONS,
  });
  if (icons.length === 0) {
    return NextResponse.json({ error: "Todavía no hay íconos generados" }, { status: 404 });
  }

  // Resolvemos los nombres únicos por adelantado: son solo strings, y así
  // prompts.txt puede referirse al nombre real de cada archivo (antes
  // listaba el base sin el sufijo de desambiguación).
  const used = new Set<string>();
  const entries = icons.map((icon) => {
    const base = safeName(icon.label);
    let name = `${base}.png`;
    let n = 2;
    while (used.has(name)) name = `${base}-${n++}.png`;
    used.add(name);
    return { name, prompt: icon.prompt, url: icon.url };
  });

  const encoder = new TextEncoder();
  let cancelled = false;
  let releaseBackpressure: (() => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const zip = new Zip((err, chunk, final) => {
        if (closed) return;
        if (err) {
          closed = true;
          controller.error(err);
          return;
        }
        controller.enqueue(chunk);
        if (final) {
          closed = true;
          controller.close();
        }
      });

      // Espera a que el consumidor drene la cola antes de seguir bajando.
      // Sin esto un cliente lento acumularía todo el zip en el buffer del
      // stream, que es justo lo que estamos tratando de evitar.
      const drain = () => {
        if ((controller.desiredSize ?? 1) > 0) return;
        return new Promise<void>((resolve) => {
          releaseBackpressure = resolve;
        });
      };

      const download = async (url: string) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return null;
          return new Uint8Array(await res.arrayBuffer());
        } catch {
          return null;
        }
      };

      void (async () => {
        const failed: string[] = [];
        try {
          // Ventana deslizante: bajamos hasta DOWNLOAD_WINDOW en paralelo
          // pero consumimos en orden, para que el zip salga determinístico.
          const inflight = new Map<number, Promise<Uint8Array | null>>();
          let next = 0;

          for (let i = 0; i < entries.length; i++) {
            if (cancelled) return;

            while (next < entries.length && inflight.size < DOWNLOAD_WINDOW) {
              inflight.set(next, download(entries[next].url));
              next++;
            }

            const bytes = await inflight.get(i)!;
            inflight.delete(i);
            if (cancelled) return;

            if (!bytes) {
              failed.push(entries[i].name);
              continue;
            }

            const file = new ZipPassThrough(entries[i].name);
            zip.add(file);
            file.push(bytes, true);

            await drain();
          }

          // Índice con el prompt de cada ícono, para poder reproducir estilos.
          const manifest = new ZipPassThrough("prompts.txt");
          zip.add(manifest);
          manifest.push(
            encoder.encode(entries.map((e) => `${e.name}\n  ${e.prompt}\n`).join("\n")),
            true,
          );

          // El status ya se envió cuando empezó el stream, así que un fallo
          // parcial no puede volver como 502: lo dejamos asentado adentro.
          if (failed.length > 0) {
            const errors = new ZipPassThrough("ERRORES.txt");
            zip.add(errors);
            errors.push(
              encoder.encode(
                `No se pudieron descargar ${failed.length} de ${entries.length} íconos:\n\n` +
                  failed.join("\n") +
                  "\n",
              ),
              true,
            );
          }

          zip.end();
        } catch (e) {
          if (closed) return;
          closed = true;
          zip.terminate();
          controller.error(e);
        }
      })();
    },

    pull() {
      const resume = releaseBackpressure;
      releaseBackpressure = null;
      resume?.();
    },

    cancel() {
      cancelled = true;
      const resume = releaseBackpressure;
      releaseBackpressure = null;
      resume?.();
    },
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="surcodia-iconos-${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
