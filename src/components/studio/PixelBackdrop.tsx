"use client";

import { useEffect, useRef } from "react";

// Cielo pixelado animado para la landing. Canvas fijo detrás del contenido:
// estrellas como píxeles crocantes que titilan lento, con alguna azul
// ocasional (ε Crucis repartida por el cielo). Barato de dibujar, se pausa
// con la pestaña oculta y respeta prefers-reduced-motion.
export function PixelBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CELL = 4; // los píxeles viven en una grilla de 4px — el drift salta de celda en celda, bien retro
    let stars: { x: number; y: number; s: number; base: number; speed: number; phase: number; vy: number; accent: boolean }[] = [];
    let raf = 0;
    let last = 0;
    let lastDraw = 0;

    function seed() {
      const w = (canvas!.width = window.innerWidth);
      const h = (canvas!.height = window.innerHeight);
      const count = Math.floor((w * h) / 11000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() < 0.72 ? CELL : Math.random() < 0.9 ? CELL * 1.5 : CELL * 2,
        base: 0.14 + Math.random() * 0.55,
        speed: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        vy: 4 + Math.random() * 14, // px/segundo hacia arriba — deriva lenta
        accent: Math.random() < 0.05,
      }));
    }

    function draw(t: number, dt: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      for (const st of stars) {
        if (!reduced) {
          st.y -= st.vy * dt;
          if (st.y < -CELL * 2) {
            st.y = h + CELL;
            st.x = Math.random() * w;
          }
        }
        const tw = reduced ? 1 : 0.5 + 0.5 * Math.sin((t / 1000) * st.speed + st.phase);
        ctx!.globalAlpha = st.base * tw;
        ctx!.fillStyle = st.accent ? "#0070F3" : "#FAFAFA";
        // Snap a la grilla al dibujar: el movimiento avanza en saltos de
        // celda, no suave — es lo que lo hace sentir pixel-art y no "polvo".
        ctx!.fillRect(Math.round(st.x / CELL) * CELL, Math.round(st.y / CELL) * CELL, st.s, st.s);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(t: number) {
      // ~30 fps alcanza — no quemamos batería.
      if (t - lastDraw > 33) {
        const dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
        last = t;
        lastDraw = t;
        draw(t, dt);
      }
      raf = requestAnimationFrame(loop);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(loop);
      }
    }

    seed();
    if (reduced) {
      draw(0, 0);
    } else {
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", seed);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", seed);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
