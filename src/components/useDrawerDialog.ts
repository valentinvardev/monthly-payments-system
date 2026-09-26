"use client";

import { useEffect, type RefObject } from "react";

// Abre y cierra un <dialog class="mobile-nav-dialog"> (los drawers del
// sitio) con un slide que entra y sale. La animación está en globals.css
// y se maneja con data-state en el dialog:
//
//   abrir:  showModal() con el panel afuera ("closed"), y dos frames
//           después "open". El primer frame, el caro, se pinta con el
//           panel quieto; recién después arranca el movimiento, así no se
//           pierden los primeros cuadros del slide.
//   cerrar: "closing" y close() cuando el panel terminó de salir.
const EXIT_FALLBACK_MS = 380;

export function useDrawerDialog(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useEffect(() => {
    const d = ref.current;
    if (!d) return;

    if (open) {
      if (!d.open) {
        d.dataset.state = "closed";
        d.showModal();
      }
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => {
          d.dataset.state = "open";
        });
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }

    if (!d.open) return;
    const panel = d.querySelector<HTMLElement>(":scope > aside");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      d.close();
      d.dataset.state = "closed";
    };
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    // transitionend burbujea: sólo cuenta el transform del panel.
    const onEnd = (e: TransitionEvent) => {
      if (e.target === panel && e.propertyName === "transform") finish();
    };
    d.dataset.state = "closing";
    panel.addEventListener("transitionend", onEnd);
    // Por si la transición no corre (pestaña oculta, se cerró antes de
    // terminar de entrar).
    const timer = window.setTimeout(finish, EXIT_FALLBACK_MS);

    return () => {
      panel.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
    };
  }, [ref, open]);
}
