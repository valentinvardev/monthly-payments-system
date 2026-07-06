"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Eye, ExternalLink, X } from "lucide-react";

// Modal de preview de proyecto: captura real del sitio en un <dialog>
// nativo (top layer). El trigger vive acá para que la page siga siendo
// server component.
export function PreviewModal({
  title,
  img,
  liveUrl,
  triggerLabel,
  openLabel,
}: {
  title: string;
  img: string;
  liveUrl: string | null;
  triggerLabel: string;
  openLabel: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 text-[13px] font-medium text-white/90 transition hover:bg-[#1f1f1f]"
      >
        <Eye className="h-3.5 w-3.5 text-white/50" />
        {triggerLabel}
      </button>

      <dialog
        ref={ref}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-auto w-[min(920px,94vw)] rounded-lg border border-white/14 bg-[#0f0f0f] p-0 text-[#fafafa] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
          <p className="truncate text-sm font-semibold tracking-[-0.01em]">{title}</p>
          <div className="flex shrink-0 items-center gap-2">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 bg-[#ededed] px-3 text-[12px] font-medium text-[#0a0a0a] transition hover:bg-white"
              >
                {openLabel}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="inline-flex h-8 w-8 items-center justify-center border border-white/12 bg-[#161616] text-white/80 transition hover:bg-[#1f1f1f]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="max-h-[72vh] overflow-y-auto">
          {/* Solo se monta la imagen con el modal abierto — no pesa en la landing */}
          {open && (
            <Image
              src={img}
              alt={`Captura de ${title}`}
              width={1200}
              height={750}
              unoptimized
              className="h-auto w-full"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
