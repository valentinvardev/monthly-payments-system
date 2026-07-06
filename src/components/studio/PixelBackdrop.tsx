"use client";

import { useEffect, useRef } from "react";

// Cielo pixelado para la landing. Reglas de robustez (aprendidas a golpes):
//
// - En mobile la barra de URL dispara `resize` EN CADA SCROLL (cambia el
//   alto del viewport). Reseedear ahí hace que todo el cielo se
//   re-randomice mientras scrolleás — el "explota". Por eso: solo se
//   reseedea si cambió el ANCHO, y con debounce de 250ms.
// - El loop solo corre en desktop (pointer fino, pantalla ancha, sin
//   reduced-motion). En mobile el cielo es estático: se dibuja una vez.
// - Flag `running` para que visibilitychange nunca apile dos loops
//   (dos loops = estrellas al doble de velocidad).
export function PixelBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const animate = !reduced && !lowPower;

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
      const count = Math.floor((w * h) / (animate ? 11000 : 15000));
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
      // dt real entre frames, capado: una pestaña que estuvo dormida no
      // puede producir un salto gigante de posiciones.
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

    // Solo reseedeamos con cambio de ANCHO real (rotación, resize de
    // ventana). El alto lo estira el CSS; la barra de URL mobile no
    // re-randomiza nada.
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
    draw(0, 0); // primer frame estático inmediato — nunca hay pantalla vacía
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
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
