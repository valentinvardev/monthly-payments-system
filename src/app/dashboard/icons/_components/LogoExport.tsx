"use client";

import { Download } from "lucide-react";
import { S_GRID, SMonogram } from "@/components/studio/pixel";

// Exporta el monograma de la landing (la S con el píxel-estrella) a PNG
// renderizándolo en un canvas con la MISMA grilla del SVG — fidelidad
// exacta, sin servidores ni APIs. Fondo transparente en ambas variantes.
const SCALE = 100; // 1 celda = 100px → PNG de 1000×900
const ACCENT = "#0070F3";

function renderLogoPng(color: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 10 * SCALE;
  canvas.height = 9 * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // La S (offset vertical de 2 celdas, igual que el viewBox del SVG).
  ctx.fillStyle = color;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (S_GRID[r][c] === "1") {
        ctx.fillRect(c * SCALE, (r + 2) * SCALE, SCALE, SCALE);
      }
    }
  }
  // El píxel que se escapa (la "estrella"), arriba a la derecha.
  ctx.fillStyle = ACCENT;
  ctx.fillRect(8.6 * SCALE, 0, SCALE, SCALE);

  return canvas.toDataURL("image/png");
}

function download(color: string, filename: string) {
  const a = document.createElement("a");
  a.href = renderLogoPng(color);
  a.download = filename;
  a.click();
}

export function LogoExport() {
  return (
    <section
      className="reveal rounded-3xl border border-white/10 bg-white/[0.02] p-6"
      style={{ animationDelay: "30ms" }}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
        Logo de la landing · PNG 1000×900 · fondo transparente
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Variante para tema oscuro: S blanca */}
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="flex items-center justify-center bg-[#0a0a0a] py-8">
            <SMonogram size={72} color="#fafafa" />
          </div>
          <div className="flex items-center justify-between border-t border-white/12 bg-[#161616] px-4 py-3">
            <span className="text-xs text-muted-foreground">Tema oscuro (S blanca)</span>
            <button
              type="button"
              onClick={() => download("#FAFAFA", "surcodia-logo-dark.png")}
              className="inline-flex items-center gap-1.5 rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/95 transition hover:bg-white/[0.12]"
            >
              <Download className="h-3 w-3" /> PNG
            </button>
          </div>
        </div>

        {/* Variante para tema claro: S tinta */}
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="flex items-center justify-center bg-[#f5f5f2] py-8">
            <SMonogram size={72} color="#0a0a0a" />
          </div>
          <div className="flex items-center justify-between border-t border-white/12 bg-[#161616] px-4 py-3">
            <span className="text-xs text-muted-foreground">Tema claro (S tinta)</span>
            <button
              type="button"
              onClick={() => download("#0A0A0A", "surcodia-logo-light.png")}
              className="inline-flex items-center gap-1.5 rounded-none border border-white/12 bg-[#161616] px-3 py-1.5 text-[11px] font-medium text-foreground/95 transition hover:bg-white/[0.12]"
            >
              <Download className="h-3 w-3" /> PNG
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
