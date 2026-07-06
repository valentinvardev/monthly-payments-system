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
    let stars: { x: number; y: number; s: number; base: number; speed: number; phase: number; accent: boolean }[] = [];
    let raf = 0;
    let last = 0;

    function seed() {
      const w = (canvas!.width = window.innerWidth);
      const h = (canvas!.height = window.innerHeight);
      const count = Math.floor((w * h) / 16000);
      stars = Array.from({ length: count }, () => {
        const cell = 3;
        return {
          x: Math.floor((Math.random() * w) / cell) * cell,
          y: Math.floor((Math.random() * h) / cell) * cell,
          s: Math.random() < 0.82 ? 2 : 3,
          base: 0.12 + Math.random() * 0.5,
          speed: 0.3 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          accent: Math.random() < 0.03,
        };
      });
    }

    function draw(t: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      for (const st of stars) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t / 1000 * st.speed + st.phase);
        ctx!.globalAlpha = st.base * tw;
        ctx!.fillStyle = st.accent ? "#0070F3" : "#FAFAFA";
        ctx!.fillRect(st.x, st.y, st.s, st.s);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(t: number) {
      // ~24 fps alcanza para un titileo — no quemamos batería.
      if (t - last > 40) {
        last = t;
        draw(t);
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
      draw(0);
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
