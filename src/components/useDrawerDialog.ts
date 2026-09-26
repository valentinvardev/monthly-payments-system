"use client";

import { useEffect, type RefObject } from "react";

// Abre y cierra un <dialog class="mobile-nav-dialog"> (los drawers del
// sitio) animando también la salida. showModal()/close() son instantáneos:
// para que el panel se vaya deslizando, al cerrar se marca el dialog con
// data-closing (globals.css corre la animación de salida) y recién cuando
// termina se llama a close().
//
// Sólo se anima donde globals.css anima (md+ y sin reduced motion). En
// teléfono el cierre sigue siendo instantáneo, como la apertura.
const ANIMATED = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

export function useDrawerDialog(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useEffect(() => {
    const d = ref.current;
    if (!d) return;

    if (open) {
      d.removeAttribute("data-closing");
      if (!d.open) d.showModal();
      return;
    }

    if (!d.open) return;
    if (!window.matchMedia(ANIMATED).matches) {
      d.close();
      return;
    }

    const panel = d.querySelector(":scope > aside");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      d.removeAttribute("data-closing");
      d.close();
    };
    // animationend burbujea: sólo cuenta la del panel, no la de un hijo.
    const onEnd = (e: Event) => {
      if (e.target === panel) finish();
    };

    d.setAttribute("data-closing", "");
    panel?.addEventListener("animationend", onEnd);
    // Por si la animación no corre (pestaña oculta, CSS distinto).
    const timer = window.setTimeout(finish, 450);

    return () => {
      panel?.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
  }, [ref, open]);
}
