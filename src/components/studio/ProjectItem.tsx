"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, CircleDot, Code2, X } from "lucide-react";
import type { StudioProject } from "@/lib/studio/content";
import { ACCENT_HEX } from "@/lib/studio/accents";
import type { Locale, StudioStrings } from "@/lib/studio/i18n";
import { StackBadge } from "@/components/studio/TechBadges";

// Glyph del proyecto: el logo real si está cargado, si no un cuadrado
// con la inicial en el acento del proyecto (mismo criterio que el
// sitio personal de Valentin).
function Glyph({
  p,
  size = 44,
}: {
  p: Pick<StudioProject, "name" | "color" | "logoUrl">;
  size?: number;
}) {
  const radius = Math.max(6, Math.round(size * 0.22));
  if (p.logoUrl) {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden border border-white/12 bg-[#161616]"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <Image
          src={p.logoUrl}
          alt=""
          width={size}
          height={size}
          unoptimized
          className="h-full w-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-semibold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: ACCENT_HEX[p.color] ?? ACCENT_HEX.blue,
        fontSize: size * 0.4,
      }}
    >
      {p.name.charAt(0)}
    </span>
  );
}

// Tarjeta compacta + drawer lateral (dialog nativo, top layer) con el
// detalle completo: descripción larga, puntos clave, stack y acciones.
export function ProjectItem({
  p,
  preview,
  locale,
  s,
}: {
  p: StudioProject;
  preview: string | null;
  locale: Locale;
  s: Pick<
    StudioStrings,
    "projectsVisit" | "drawerHighlights" | "drawerStack" | "drawerCode"
  >;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const short = locale === "en" && p.shortEn ? p.shortEn : p.short;
  const long = (locale === "en" && p.longEn ? p.longEn : p.long) || short;
  const features = locale === "en" && p.featuresEn.length > 0 ? p.featuresEn : p.features;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-full flex-col rounded-lg border border-white/12 bg-[#0f0f0f] p-5 text-left transition-colors hover:border-white/25"
      >
        <Glyph p={p} />
        <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-white/95">
          {p.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/55">{short}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {p.stack.slice(0, 3).map((tech) => (
              <StackBadge key={tech} name={tech} />
            ))}
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-white/80" />
        </div>
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
        className="mobile-nav-dialog"
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex h-full w-[min(460px,94vw)] flex-col overflow-y-auto border-l border-white/12 bg-[#0f0f0f] text-[#fafafa]"
        >
          <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0f0f0f] px-6 py-5">
            <div className="flex min-w-0 items-center gap-4">
              <Glyph p={p} size={52} />
              <h2 className="min-w-0 truncate text-base font-semibold tracking-[-0.02em]">
                {p.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-white/12 bg-[#161616] text-white/80 transition hover:bg-[#1f1f1f]"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 px-6 py-6">
            {preview && (
              <div className="mb-6 overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={preview}
                  alt={`Captura de ${p.name}`}
                  width={880}
                  height={550}
                  unoptimized
                  className="h-auto w-full object-cover object-top"
                />
              </div>
            )}

            <p className="text-[14px] leading-relaxed text-white/65">{long}</p>

            {features.length > 0 && (
              <>
                <h4 className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                  {s.drawerHighlights}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-white/70">
                      <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35" />
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {p.stack.length > 0 && (
              <>
                <h4 className="mt-7 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                  {s.drawerStack}
                </h4>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack.map((tech) => (
                    <StackBadge key={tech} name={tech} />
                  ))}
                </div>
              </>
            )}
          </div>

          <footer className="sticky bottom-0 flex items-center gap-2 border-t border-white/10 bg-[#0f0f0f] px-6 py-4">
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel inline-flex h-10 flex-1 items-center justify-center gap-1.5 bg-[#ededed] px-4 text-[10px] text-[#0a0a0a] transition hover:bg-white"
              >
                {s.projectsVisit}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {p.repoUrl && (
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel inline-flex h-10 items-center justify-center gap-1.5 border border-white/12 bg-[#161616] px-4 text-[10px] text-white/90 transition hover:bg-[#1f1f1f]"
              >
                <Code2 className="h-3.5 w-3.5" />
                {s.drawerCode}
              </a>
            )}
          </footer>
        </aside>
      </dialog>
    </>
  );
}

// Mini-logos para la tarjeta de nicho (como el strip del sitio personal).
export function ProjectMiniLogos({
  projects,
}: {
  projects: Pick<StudioProject, "slug" | "name" | "color" | "logoUrl">[];
}) {
  if (projects.length === 0) return null;
  return (
    <span className="flex items-center gap-1.5">
      {projects.slice(0, 4).map((p) => (
        <span key={p.slug} title={p.name}>
          <Glyph p={p} size={22} />
        </span>
      ))}
      {projects.length > 4 && (
        <span className="font-mono text-[10px] text-white/40">+{projects.length - 4}</span>
      )}
    </span>
  );
}
