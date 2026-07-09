"use client";

import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { trpc } from "@/trpc/react";

// Se genera UN elemento por vez (el server además fuerza "exactly one
// isolated icon" en el sufijo). El estilo va separado para poder
// cambiar el elemento sin reescribir todo.
const ELEMENTS = [
  { label: "Luna", prompt: "a crescent moon with a small decorative swirl" },
  { label: "Sol", prompt: "a sun with wavy rays" },
  { label: "Estrella", prompt: "a five-pointed star" },
  { label: "Cometa", prompt: "a shooting comet with a flowing tail" },
  { label: "Destello", prompt: "a four-pointed sparkle" },
];

const DEFAULT_STYLE =
  "flat vector icon, vibrant Lisa Frank style rainbow gradient fill (pink, purple, cyan, green, yellow), soft rounded shapes, playful 90s sticker aesthetic, clean smooth edges";

type Result = { id: number; src: string; label: string };

export function IconStudio() {
  const [element, setElement] = useState(ELEMENTS[0].prompt);
  const [elementLabel, setElementLabel] = useState(ELEMENTS[0].label);
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [count, setCount] = useState(2);
  const [results, setResults] = useState<Result[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const gen = trpc.icons.generate.useMutation({
    onSuccess: (res) => {
      setResults((prev) => [
        ...res.images.map((src, i) => ({ id: Date.now() + i, src, label: elementLabel })),
        ...prev,
      ]);
      setWarnings(res.errors);
    },
    onError: (e) => setError(e.message),
  });

  const composed = `${element.trim()}, ${style.trim()}`;

  function onGenerate() {
    setError(null);
    setWarnings([]);
    gen.mutate({ prompt: composed, count });
  }

  return (
    <div className="space-y-6">
      <section
        className="reveal rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5"
        style={{ animationDelay: "60ms" }}
      >
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Elemento (uno por vez)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {ELEMENTS.map((e) => (
              <button
                key={e.label}
                type="button"
                onClick={() => {
                  setElement(e.prompt);
                  setElementLabel(e.label);
                }}
                className={[
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                  element === e.prompt
                    ? "border-white/40 bg-white/[0.12] text-foreground"
                    : "border-white/12 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground",
                ].join(" ")}
              >
                {e.label}
              </button>
            ))}
          </div>
          <input
            value={element}
            onChange={(e) => {
              setElement(e.target.value);
              setElementLabel("Personalizado");
            }}
            className="mt-2.5 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground transition focus:border-white/30 focus:bg-white/[0.07] focus:outline-none"
          />
        </div>

        <label className="block">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Estilo
          </span>
          <textarea
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground transition focus:border-white/30 focus:bg-white/[0.07] focus:outline-none"
          />
        </label>

        <p className="text-[11px] text-muted-foreground/70">
          El servidor agrega solo: “exactamente UN ícono aislado, nunca un set ni un patrón,
          centrado, fondo blanco liso (se recorta), sin marco, sin texto”.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Variantes
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-xl border border-white/12 bg-white/[0.04] px-2.5 py-1.5 text-sm text-foreground focus:outline-none"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={gen.isPending || element.trim().length < 3}
            onClick={onGenerate}
            className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/[0.10] px-5 py-2 text-sm font-medium text-foreground transition hover:bg-white/[0.15] hover:border-white/32 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {gen.isPending ? `Generando ${elementLabel}…` : `Generar ${elementLabel}`}
          </button>
          <button
            type="button"
            onClick={() => setStyle(DEFAULT_STYLE)}
            className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70 transition hover:text-foreground"
          >
            Restaurar estilo base
          </button>
        </div>
        {error && <p className="text-sm text-rose-200/85">{error}</p>}
        {warnings.length > 0 && (
          <p className="text-xs text-yellow-100/80">
            {warnings.length} variante(s) fallaron: {warnings[0]}
          </p>
        )}
      </section>

      {gen.isPending && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl border border-white/8 bg-white/[0.04]"
            />
          ))}
        </div>
      )}

      {results.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {results.length} generados en esta sesión · 500×500 PNG transparente
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((r, i) => (
              <figure
                key={r.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10"
                style={{
                  backgroundImage:
                    "conic-gradient(rgba(255,255,255,0.09) 25%, transparent 0 50%, rgba(255,255,255,0.09) 0 75%, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} alt={`Ícono ${r.label} ${i + 1}`} className="h-auto w-full" />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/80">
                  {r.label}
                </span>
                <a
                  href={r.src}
                  download={`icono-${r.label.toLowerCase()}-${r.id}.png`}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Download className="h-3 w-3" /> PNG
                </a>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
