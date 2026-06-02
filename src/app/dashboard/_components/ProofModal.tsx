"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Download } from "lucide-react";

function fileExtension(signedUrl: string): string {
  try {
    const u = new URL(signedUrl);
    const last = u.pathname.split("/").pop() ?? "";
    return last.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "avif", "bmp"]);

export function ProofModal({ url }: { url: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const ext = fileExtension(url);
  const isImage = IMAGE_EXTS.has(ext);
  const isPdf = ext === "pdf";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-foreground/70 underline-offset-2 hover:underline hover:text-foreground"
      >
        ver comprobante
      </button>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => {
          // Click outside the inner panel closes (native dialog click target
          // is the dialog itself when clicking the backdrop).
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="m-auto w-full max-w-3xl rounded-3xl bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-md"
      >
        <div
          style={{
            backgroundColor: "oklch(0.16 0.015 245)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "24px",
            boxShadow: "0 32px 80px -28px rgba(0,0,0,0.65)",
            color: "var(--color-foreground)",
          }}
          className="overflow-hidden"
        >
          <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/85">
              Comprobante
            </p>
            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-foreground/85 transition hover:bg-white/[0.08] hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir
              </a>
              <a
                href={url}
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-foreground/85 transition hover:bg-white/[0.08] hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-foreground/80 transition hover:bg-white/[0.08] hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          <div className="bg-black/40 p-3">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt="comprobante"
                className="mx-auto max-h-[75vh] w-auto rounded-xl object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={url}
                title="comprobante"
                className="h-[75vh] w-full rounded-xl bg-white"
              />
            ) : (
              <div className="rounded-xl bg-white/[0.03] p-8 text-center text-sm text-muted-foreground">
                <p>
                  No podemos previsualizar este formato (
                  <span className="font-mono">{ext || "desconocido"}</span>).
                </p>
                <a
                  href={url}
                  download
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12px] font-medium text-foreground/95 transition hover:bg-white/[0.10]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar el archivo
                </a>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
