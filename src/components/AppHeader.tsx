import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { SMonogram } from "@/components/studio/pixel";
import { HeaderNavLink } from "@/components/HeaderNavLink";
import { MobileNav, type MobileNavItem } from "@/components/MobileNav";

const ADMIN_NAV: MobileNavItem[] = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/clients", label: "Clientes" },
  { href: "/dashboard/invoices", label: "Facturas" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/prospectos", label: "Prospectos" },
  { href: "/dashboard/quotes", label: "Presupuestos" },
  { href: "/dashboard/payment-methods", label: "Métodos" },
  { href: "/dashboard/emails", label: "Emails" },
  { href: "/dashboard/icons", label: "Íconos" },
];

const CLIENT_NAV: MobileNavItem[] = [{ href: "/portal", label: "Mis pagos" }];

export async function AppHeader() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const homeHref = isAdmin ? "/dashboard" : "/portal";
  const displayName = user.fullName ?? user.email;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const navItems = isAdmin ? ADMIN_NAV : CLIENT_NAV;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0a0a0a] lg:bg-[#0a0a0a]/85 lg:backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Mismo lockup que la landing; cambia sólo la palabra de
            contexto — allá dice "studio", acá "panel" o "portal". */}
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-85"
        >
          <SMonogram size={22} color="#fafafa" />
          <span className="font-pixel text-[13px] tracking-[0.02em] text-[#fafafa]">
            surcodia
          </span>
          <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.38em] text-white/45 sm:inline">
            {isAdmin ? "panel" : "portal"}
          </span>
        </Link>

        {/* Desktop nav (lg+): nueve secciones en tipografía pixel piden
            más ancho que los cuatro links de la landing. */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((it) => (
            <HeaderNavLink key={it.href} href={it.href}>
              {it.label}
            </HeaderNavLink>
          ))}

          <span className="mx-2 h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2.5 pr-1">
            <div className="flex h-7 w-7 items-center justify-center border border-white/12 bg-[#161616] font-mono text-[10px] text-white/80">
              {initials}
            </div>
            <div className="hidden text-right leading-tight xl:block">
              <div className="text-[11px] text-white/90">{displayName}</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-white/45">
                {user.role.toLowerCase()}
              </div>
            </div>
          </div>

          <form action={signOut}>
            <button type="submit" className="studio-btn h-8 px-3 font-pixel text-[10px]">
              Salir
            </button>
          </form>
        </nav>

        {/* Mobile / tablet (< lg): avatar + hamburguesa */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center border border-white/12 bg-[#161616] font-mono text-[10px] text-white/80">
            {initials}
          </div>
          <MobileNav
            items={navItems}
            displayName={displayName}
            email={user.email}
            initials={initials}
            role={user.role}
          />
        </div>
      </div>
    </header>
  );
}
