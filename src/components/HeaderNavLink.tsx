"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Link del nav del studio. La sección activa se marca con el acento:
// el texto en blanco y un cuadradito azul debajo — el mismo pixel que
// se escapa del monograma.
export function HeaderNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // /dashboard sólo está activo exacto; el resto también en sus hijos
  // (/dashboard/clients/123 mantiene "Clientes" encendido).
  const active =
    href === "/dashboard" || href === "/portal"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "relative px-2.5 py-1.5 font-pixel text-[10px] transition",
        active ? "text-white" : "text-white/55 hover:text-white",
      ].join(" ")}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-2.5 -bottom-px h-[2px] bg-[#0070F3]"
        />
      )}
    </Link>
  );
}
