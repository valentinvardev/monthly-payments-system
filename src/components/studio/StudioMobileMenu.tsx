"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/studio/i18n";
import { LangToggle } from "@/components/studio/LangToggle";

export type StudioNavItem = { href: string; label: string };

// Sidebar mobile de la landing. Mismo patrón que el MobileNav del panel:
// <dialog> nativo (top layer, inmune a containing blocks del header con
// backdrop-filter) reutilizando los estilos .mobile-nav-dialog.
export function StudioMobileMenu({
  items,
  locale,
  loginHref,
  loginLabel,
}: {
  items: StudioNavItem[];
  locale: Locale;
  loginHref: string;
  loginLabel: string;
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.04] text-white/85 transition hover:bg-white/[0.09] sm:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <dialog
        ref={dialogRef}
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
          className="ml-auto flex h-full w-[84%] max-w-[300px] flex-col border-l border-white/12 bg-[#0d0d0c]"
        >
          <header className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-white">
              surcodia
              <span className="ml-2 font-mono text-[8.5px] font-normal uppercase tracking-[0.4em] text-white/45">
                studio
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="inline-flex h-8 w-8 items-center justify-center border border-white/12 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.09]"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it.href}>
                  <a
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <span className="inline-block h-1.5 w-1.5 bg-[#0070F3]" />
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <footer className="space-y-4 border-t border-white/8 px-5 py-5">
            <LangToggle locale={locale} />
            <Link
              href={loginHref}
              onClick={() => setOpen(false)}
              className="block border border-white/18 bg-white/[0.05] px-4 py-2.5 text-center text-sm text-white/90 transition hover:bg-white/[0.1]"
            >
              {loginLabel}
            </Link>
          </footer>
        </aside>
      </dialog>
    </>
  );
}
