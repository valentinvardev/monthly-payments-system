"use client";

import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { trpc } from "@/trpc/react";

// Prompt base pedido por Valentin — editable antes de cada generación.
const DEFAULT_PROMPT =
  "Iconos (lunas, soles, estrellas, cometas) y una gradiente (lisa frank artista) de colores.";

type Result = { id: number; src: string };

export function IconStudio() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [count, setCount] = useState(2);
  const [results, setResults] = useState<Result[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const gen = trpc.icons.generate.useMutation({
    onSuccess: (res) => {
      // Los nuevos van arriba; el historial de la sesión queda abajo.
      setResults((prev) => [
        ...res.images.map((src, i) => ({ id: Date.now() + i, src })),
        ...prev,
      ]);
      setWarnings(res.errors);
    },
    onError: (e) => setError(e.message),
  });

  function onGenerate() {
    setError(null);
    setWarnings([]);
    gen.mutate({ prompt, count });
  }

  return (
    <div className="space-y-6">
      <section className="reveal rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4" style={{ animationDelay: "60ms" }}>
        <label className="block">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Prompt
          </span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground transition focus:border-white/30 focus:bg-white/[0.07] focus:outline-none"
          />
        </label>
        <p className="text-[11px] text-muted-foreground/70">
          Se agrega solo, no hace falta escribirlo: composición centrada 1:1, fondo blanco liso
          (para el recorte), sin texto ni marca de agua.
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
            disabled={gen.isPending || prompt.trim().length < 4}
            onClick={onGenerate}
            className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/[0.10] px-5 py-2 text-sm font-medium text-foreground transition hover:bg-white/[0.15] hover:border-white/32 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {gen.isPending ? `Generando ${count}…` : "Generar"}
          </button>
          <button
            type="button"
            onClick={() => setPrompt(DEFAULT_PROMPT)}
            className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70 transition hover:text-foreground"
          >
            Restaurar prompt base
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
                  // Damero de fondo para ver la transparencia real.
                  backgroundImage:
                    "conic-gradient(rgba(255,255,255,0.09) 25%, transparent 0 50%, rgba(255,255,255,0.09) 0 75%, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} alt={`Ícono generado ${i + 1}`} className="h-auto w-full" />
                <a
                  href={r.src}
                  download={`icono-${r.id}.png`}
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
