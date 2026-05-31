import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { BrandMark, Wordmark } from "@/components/BrandMark";

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

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-x-0 border-t-0 border-b border-white/8 rounded-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            <BrandMark
              size={26}
              className="transition-transform group-hover:scale-105"
            />
            <Wordmark />
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {user.role === "ADMIN" && (
              <>
                <HeaderLink href="/dashboard">Resumen</HeaderLink>
                <HeaderLink href="/dashboard/clients">Clientes</HeaderLink>
                <HeaderLink href="/dashboard/invoices">Facturas</HeaderLink>
                <span className="mx-2 h-4 w-px bg-white/8" />
              </>
            )}
            <div className="flex items-center gap-3 pr-1 pl-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-medium text-foreground/80">
                {initials}
              </div>
              <div className="hidden sm:block text-right leading-tight">
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
