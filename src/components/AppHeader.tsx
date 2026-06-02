import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { BrandMark, Wordmark } from "@/components/BrandMark";
import { MobileNav, type MobileNavItem } from "@/components/MobileNav";

const ADMIN_NAV: MobileNavItem[] = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/clients", label: "Clientes" },
  { href: "/dashboard/invoices", label: "Facturas" },
  { href: "/dashboard/payment-methods", label: "Métodos" },
  { href: "/dashboard/emails", label: "Emails" },
];

const CLIENT_NAV: MobileNavItem[] = [
  { href: "/portal", label: "Mis pagos" },
];

export async function AppHeader() {
  const user = await getCurrentUser();
  if (!user) return null;

  const homeHref = user.role === "ADMIN" ? "/dashboard" : "/portal";
  const displayName = user.fullName ?? user.email;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  const navItems = user.role === "ADMIN" ? ADMIN_NAV : CLIENT_NAV;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-x-0 border-t-0 border-b border-white/8 rounded-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <Link href={homeHref} className="flex min-w-0 items-center gap-2.5 group">
            <BrandMark
              size={26}
              className="shrink-0 transition-transform group-hover:scale-105"
            />
            <Wordmark className="truncate" />
          </Link>

          {/* Desktop nav (md+) */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {user.role === "ADMIN" && (
              <>
                {ADMIN_NAV.map((it) => (
                  <HeaderLink key={it.href} href={it.href}>
                    {it.label}
                  </HeaderLink>
                ))}
                <span className="mx-2 h-4 w-px bg-white/8" />
              </>
            )}
            <div className="flex items-center gap-3 pr-1 pl-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-medium text-foreground/80">
                {initials}
              </div>
              <div className="hidden lg:block text-right leading-tight">
                <div className="text-[11px] text-foreground/90">{displayName}</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80">
                  {user.role.toLowerCase()}
                </div>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="ml-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/75 hover:bg-white/[0.07] hover:text-foreground transition"
              >
                Salir
              </button>
            </form>
          </nav>

          {/* Mobile (< md): avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[11px] font-medium text-foreground/85">
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
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition"
    >
      {children}
    </Link>
  );
}
