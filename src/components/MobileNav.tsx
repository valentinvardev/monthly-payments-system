"use client";

import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 reveal"
          style={{ animationDuration: "200ms" }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer */}
          <aside
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-[320px] flex-col glass-strong rounded-l-3xl rounded-r-none"
            style={{ animationDuration: "240ms" }}
          >
            <header className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2">
                <span
                  className="font-display text-base font-medium tracking-tight text-foreground"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  Surcodia
                </span>
              </div>
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
        </div>
      )}
    </>
  );
}
