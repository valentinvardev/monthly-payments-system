"use client";

import { useEffect, useRef } from "react";

// Cielo pixelado del studio.
//
// MOBILE (< md): nada de canvas. Un canvas fixed a pantalla completa +
// el backdrop-blur del header obligan al GPU del teléfono a recomponer
// capas en cada frame de scroll — eso era el lag "por culpa del fondo".
// En su lugar va un patrón SVG estático repetido (tile de 160px, costo
// cero, scrollea con el contenido).
//
// DESKTOP (md+): canvas animado. Reglas de robustez: reseed solo si
// cambia el ANCHO (la barra de URL mobile dispara resize por alto),
// flag `running` para que visibilitychange nunca apile dos loops, dt
// capado para que una pestaña dormida no salte, arranque diferido.

const STAR_TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect x='20' y='30' width='3' height='3' fill='%23fafafa' opacity='.45'/%3E%3Crect x='90' y='10' width='2' height='2' fill='%23fafafa' opacity='.3'/%3E%3Crect x='140' y='60' width='3' height='3' fill='%23fafafa' opacity='.4'/%3E%3Crect x='60' y='90' width='2' height='2' fill='%23fafafa' opacity='.25'/%3E%3Crect x='112' y='128' width='3' height='3' fill='%230070F3' opacity='.55'/%3E%3Crect x='30' y='140' width='2' height='2' fill='%23fafafa' opacity='.35'/%3E%3Crect x='128' y='96' width='2' height='2' fill='%23fafafa' opacity='.2'/%3E%3C/svg%3E")`;

export function PixelBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // En mobile el canvas está display:none — no gastamos ni un frame.
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = !reduced;

    const CELL = 4;
    type Star = {
      x: number;
      y: number;
      s: number;
      base: number;
      speed: number;
      phase: number;
      vy: number;
      accent: boolean;
    };
    let stars: Star[] = [];
    let raf = 0;
    let running = false;
    let lastTime = 0;
    let seededWidth = 0;

    function seed() {
      const w = (canvas!.width = window.innerWidth);
      const h = (canvas!.height = Math.max(window.innerHeight, canvas!.height || 0));
      seededWidth = w;
      const count = Math.floor((w * h) / 11000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() < 0.72 ? CELL : Math.random() < 0.9 ? CELL * 1.5 : CELL * 2,
        base: 0.14 + Math.random() * 0.55,
        speed: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        vy: 4 + Math.random() * 14,
        accent: Math.random() < 0.05,
      }));
    }

    function draw(t: number, dt: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      for (const st of stars) {
        if (animate && dt > 0) {
          st.y -= st.vy * dt;
          if (st.y < -CELL * 2) {
            st.y = h + CELL;
            st.x = Math.random() * w;
          }
        }
        const tw = animate ? 0.5 + 0.5 * Math.sin((t / 1000) * st.speed + st.phase) : 1;
        ctx!.globalAlpha = st.base * tw;
        ctx!.fillStyle = st.accent ? "#0070F3" : "#FAFAFA";
        ctx!.fillRect(Math.round(st.x / CELL) * CELL, Math.round(st.y / CELL) * CELL, st.s, st.s);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(t: number) {
      if (!running) return;
      const dt = lastTime ? Math.min((t - lastTime) / 1000, 0.05) : 0;
      if (t - lastTime > 33 || !lastTime) {
        lastTime = t;
        draw(t, dt);
      }
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || !animate || document.hidden) return;
      running = true;
      lastTime = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth === seededWidth) return;
        seed();
        if (!animate) draw(0, 0);
      }, 250);
    }

    seed();
    draw(0, 0);
    let startTimer = 0;
    if (animate) {
      startTimer = window.setTimeout(start, 500);
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(resizeTimer);
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      {/* Mobile: patrón estático que scrollea con la página — sin capa fija,
          sin canvas, sin trabajo por frame. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 md:hidden"
        style={{ backgroundImage: STAR_TILE, backgroundSize: "160px 160px" }}
      />
      {/* Desktop: canvas animado. */}
      <canvas
        ref={ref}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 hidden md:block"
      />
    </>
  );
}
