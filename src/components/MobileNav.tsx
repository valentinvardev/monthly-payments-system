"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOut } from "@/app/auth/actions";

export type MobileNavItem = { href: string; label: string };

export function MobileNav({
  items,
  displayName,
  email,
  initials,
  role,
}: {
  items: MobileNavItem[];
  displayName: string;
  email: string;
  initials: string;
  role: string;
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // Native <dialog> escapes containing-block traps created by the
  // header's backdrop-filter — `fixed inset-0` alone gets clipped to
  // the header. showModal() puts the dialog in the top layer.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground/85 transition hover:bg-white/[0.08] hover:text-foreground"
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
          // Click on the dialog itself (the empty area left of the
          // drawer) closes; clicks inside <aside> are stopped below.
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="mobile-nav-dialog"
      >
        {/* Fondo SÓLIDO a propósito: animar transform sobre un elemento
            con backdrop-filter (glass) glitchea en GPUs de teléfono —
            el panel se pinta negro o no aparece. */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex h-full w-[86%] max-w-[320px] flex-col rounded-l-3xl rounded-r-none border-l border-white/10 bg-[oklch(0.16_0.015_245)]"
        >
          <header className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <span
              className="font-display text-base font-medium tracking-tight text-foreground"
              style={{ letterSpacing: "-0.01em" }}
            >
              Surcodia
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground/80 transition hover:bg-white/[0.08] hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {items.length > 0 ? (
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {items.map((it) => {
                  const active = pathname === it.href;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className={[
                          "block rounded-xl px-4 py-3 text-sm transition",
                          active
                            ? "bg-white/[0.07] text-foreground border border-white/10"
                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground border border-transparent",
                        ].join(" ")}
                      >
                        {it.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : (
            <div className="flex-1" />
          )}

          <footer className="border-t border-white/8 px-5 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-medium text-foreground/85">
                {initials}
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm text-foreground/95">{displayName}</div>
                <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
                  {role.toLowerCase()} · {email}
                </div>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-full border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-foreground/90 transition hover:bg-white/[0.08]"
              >
                Salir
              </button>
            </form>
          </footer>
        </aside>
      </dialog>
    </>
  );
}
