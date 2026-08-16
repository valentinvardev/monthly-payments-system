"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOut } from "@/app/auth/actions";

export type MobileNavItem = { href: string; label: string };

// Drawer del panel y el portal. Gemelo del StudioMobileMenu de la
// landing: mismo <dialog>, mismo fondo, mismos items en tipografía
// pixel con el cuadradito azul de viñeta. Acá además marcamos la
// sección activa y cerramos con los datos de la sesión.
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
        className="inline-flex h-9 w-9 items-center justify-center border border-white/12 bg-[#161616] text-white/85 transition hover:bg-[#1f1f1f] hover:text-white"
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
        <aside
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex h-full w-[86%] max-w-[320px] flex-col border-l border-white/12 bg-[#0d0d0c]"
        >
          <header className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <span className="text-white">
              <span className="font-pixel text-[13px]">surcodia</span>
              <span className="ml-2 text-[9px] font-medium uppercase tracking-[0.38em] text-white/45">
                {role === "ADMIN" ? "panel" : "portal"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="inline-flex h-8 w-8 items-center justify-center border border-white/12 bg-[#161616] text-white/80 transition hover:bg-[#1f1f1f] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {items.length > 0 ? (
            <nav className="flex-1 overflow-y-auto px-3 py-5">
              <ul className="space-y-1">
                {items.map((it) => {
                  const active =
                    it.href === "/dashboard" || it.href === "/portal"
                      ? pathname === it.href
                      : pathname === it.href || pathname.startsWith(`${it.href}/`);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "font-pixel flex items-center gap-3 px-4 py-3 text-[11px] transition",
                          active
                            ? "bg-white/[0.06] text-white"
                            : "text-white/75 hover:bg-white/[0.05] hover:text-white",
                        ].join(" ")}
                      >
                        <span
                          aria-hidden
                          className={[
                            "inline-block h-1.5 w-1.5",
                            active ? "bg-[#0070F3]" : "bg-white/25",
                          ].join(" ")}
                        />
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

          <footer className="space-y-4 border-t border-white/8 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/12 bg-[#161616] font-mono text-[10px] text-white/80">
                {initials}
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm text-white/95">{displayName}</div>
                <div className="truncate text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {role.toLowerCase()} · {email}
                </div>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="studio-btn font-pixel w-full px-4 py-2.5 text-[11px]"
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
