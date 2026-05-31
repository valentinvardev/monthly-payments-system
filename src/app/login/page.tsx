import { listDemoUsers } from "@/lib/auth";
import { BrandMark } from "@/components/BrandMark";
import { loginAsDemoUser } from "./actions";

export default function LoginPage() {
  const users = listDemoUsers();
  const admin = users.find((u) => u.role === "ADMIN");
  const clients = users.filter((u) => u.role === "CLIENT");

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.45 0.08 215 / 0.5), transparent 70%)",
          }}
        />
      </div>

      <div className="glass-strong relative w-full max-w-md rounded-3xl p-8 reveal">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="float-soft mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <BrandMark size={40} />
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
            Surcodia
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Cobros mensuales tan claros como un día austral.
          </p>
          <div className="mt-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground/85">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/70" />
            Modo demo · datos en memoria
          </div>
        </header>

        <section className="space-y-2">
          <p className="px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
            Administrador
          </p>
          {admin && <UserButton user={admin} role="ADMIN" />}
        </section>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">
          <span className="h-px flex-1 bg-white/8" />
          o entrá como
          <span className="h-px flex-1 bg-white/8" />
        </div>

        <section className="space-y-2">
          {clients.map((u) => (
            <UserButton key={u.id} user={u} role="CLIENT" />
          ))}
        </section>

        <footer className="mt-7 text-center text-[9px] uppercase tracking-[0.24em] text-muted-foreground/50">
          glaciar · sur · {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}

function UserButton({
  user,
  role,
}: {
  user: { id: string; fullName: string; email: string };
  role: "ADMIN" | "CLIENT";
}) {
  const isAdmin = role === "ADMIN";
  return (
    <form action={loginAsDemoUser}>
      <input type="hidden" name="userId" value={user.id} />
      <button
        type="submit"
        className={[
          "group/btn relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all",
          isAdmin
            ? "border-white/14 bg-white/[0.06] hover:bg-white/[0.09] hover:border-white/22"
            : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.05]",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              "flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-medium",
              isAdmin
                ? "border border-white/15 bg-white/[0.08] text-foreground/95"
                : "border border-white/8 bg-white/[0.04] text-foreground/70",
            ].join(" ")}
          >
            {user.fullName
              .split(/\s+/)
              .slice(0, 2)
              .map((s) => s[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground/95">{user.fullName}</div>
            <div className="text-[11px] text-muted-foreground">{user.email}</div>
          </div>
          <span className="text-foreground/30 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:text-foreground/70">
            →
          </span>
        </div>
      </button>
    </form>
  );
}
