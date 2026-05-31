import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export async function AppHeader() {
  const user = await getCurrentUser();
  if (!user) return null;

  const homeHref = user.role === "ADMIN" ? "/dashboard" : "/portal";

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href={homeHref} className="text-sm font-semibold">
          Payment System
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900">
            Demo
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user.role === "ADMIN" && (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Resumen
              </Link>
              <Link
                href="/dashboard/clients"
                className="text-muted-foreground hover:text-foreground"
              >
                Clientes
              </Link>
              <Link
                href="/dashboard/invoices"
                className="text-muted-foreground hover:text-foreground"
              >
                Facturas
              </Link>
            </>
          )}
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {user.fullName} <span className="opacity-60">({user.role.toLowerCase()})</span>
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
            >
              Salir
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
