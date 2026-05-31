import { listDemoUsers } from "@/lib/auth";
import { loginAsDemoUser } from "./actions";

export default function LoginPage() {
  const users = listDemoUsers();
  const admin = users.find((u) => u.role === "ADMIN");
  const clients = users.filter((u) => u.role === "CLIENT");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold">Modo demo</h1>
          <p className="text-sm text-muted-foreground">
            Elegí con qué usuario querés entrar. Sin DB, sin Supabase — los datos viven en memoria
            y se reinician al reiniciar el server.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Administrador
          </h2>
          {admin && <UserButton user={admin} variant="primary" />}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Clientes (portal de autogestión)
          </h2>
          <div className="space-y-2">
            {clients.map((u) => (
              <UserButton key={u.id} user={u} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function UserButton({
  user,
  variant = "default",
}: {
  user: { id: string; fullName: string; email: string };
  variant?: "primary" | "default";
}) {
  const cls =
    variant === "primary"
      ? "w-full rounded-lg bg-primary px-4 py-3 text-left text-sm text-primary-foreground hover:bg-primary/80"
      : "w-full rounded-lg border bg-background px-4 py-3 text-left text-sm hover:bg-muted";
  return (
    <form action={loginAsDemoUser}>
      <input type="hidden" name="userId" value={user.id} />
      <button type="submit" className={cls}>
        <div className="font-medium">{user.fullName}</div>
        <div className="text-xs opacity-80">{user.email}</div>
      </button>
    </form>
  );
}
