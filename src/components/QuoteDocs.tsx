"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, X } from "lucide-react";
import { formatBytes } from "@/lib/format";

export type QuoteDoc = {
  id: string;
  filename: string;
  sizeBytes: number;
  // Signed URL con TTL, resuelta en el server. null si Storage no la
  // pudo firmar: la fila se muestra igual, apagada, en lugar de
  // desaparecer sin que nadie entienda que faltaba un documento.
  url: string | null;
};

// El signed URL es cross-origin, así que el atributo `download` de un
// <a> no alcanza: el navegador lo ignora y abre el PDF. Supabase acepta
// ?download=<nombre> y responde con Content-Disposition: attachment.
function downloadUrl(url: string, filename: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(filename)}`;
}

// Lista de PDFs adjuntos con un visor en <dialog> nativo (top layer, sin
// z-index que pelear). El iframe se monta sólo con el modal abierto: si
// no, cada presupuesto abierto se descargaría todos los PDFs de una.
export function QuoteDocs({ docs, label }: { docs: QuoteDoc[]; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [openAt, setOpenAt] = useState<number | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (openAt !== null && !d.open) d.showModal();
    if (openAt === null && d.open) d.close();
  }, [openAt]);

  if (docs.length === 0) return null;

  const current = openAt === null ? null : docs[openAt];
  const go = (delta: number) =>
    setOpenAt((i) => (i === null ? null : (i + delta + docs.length) % docs.length));

  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{label}</p>

      <ul className="mt-3 divide-y divide-white/8 border border-white/12 bg-[#0d0d0c]">
        {docs.map((doc, i) => (
          <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-[#0070F3]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white/90">{doc.filename}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                PDF · {formatBytes(doc.sizeBytes)}
              </p>
            </div>
            {doc.url ? (
              <button
                type="button"
                onClick={() => setOpenAt(i)}
                className="shrink-0 border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-white/85 transition hover:border-white/25 hover:bg-[#1f1f1f] hover:text-white"
              >
                Ver
              </button>
            ) : (
              <span className="shrink-0 text-[11px] text-white/35">No disponible</span>
            )}
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        onCancel={(e) => {
          e.preventDefault();
          setOpenAt(null);
        }}
        onClose={() => setOpenAt(null)}
        onClick={(e) => {
          if (e.target === ref.current) setOpenAt(null);
        }}
        onKeyDown={(e) => {
          if (docs.length < 2) return;
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        className="m-auto w-[min(1000px,95vw)] border border-white/14 bg-[#0f0f0f] p-0 text-[#fafafa] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        {current && (
          <>
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {docs.length > 1 && (
                  <span className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Anterior"
                      className="inline-flex h-7 w-7 items-center justify-center border border-white/12 bg-[#161616] text-white/75 transition hover:bg-[#1f1f1f] hover:text-white"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Siguiente"
                      className="-ml-px inline-flex h-7 w-7 items-center justify-center border border-white/12 bg-[#161616] text-white/75 transition hover:bg-[#1f1f1f] hover:text-white"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
                <p className="truncate text-sm text-white/90">{current.filename}</p>
                {docs.length > 1 && (
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-white/35">
                    {openAt! + 1}/{docs.length}
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* En iOS el <iframe> no renderiza PDFs; por eso abrir y
                    descargar están siempre a la vista, no escondidos
                    detrás de un menú. */}
                <a
                  href={current.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 border border-white/12 bg-[#161616] px-3 text-[11px] font-medium text-white/85 transition hover:bg-[#1f1f1f] hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir
                </a>
                <a
                  href={current.url ? downloadUrl(current.url, current.filename) : "#"}
                  className="inline-flex h-8 items-center gap-1.5 border border-white/12 bg-[#161616] px-3 text-[11px] font-medium text-white/85 transition hover:bg-[#1f1f1f] hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </a>
                <button
                  type="button"
                  onClick={() => setOpenAt(null)}
                  aria-label="Cerrar"
                  className="inline-flex h-8 w-8 items-center justify-center border border-white/12 bg-[#161616] text-white/80 transition hover:bg-[#1f1f1f] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <iframe
              key={current.id}
              src={current.url ?? undefined}
              title={current.filename}
              className="h-[78vh] w-full bg-white"
            />
          </>
        )}
      </dialog>
    </section>
  );
}
