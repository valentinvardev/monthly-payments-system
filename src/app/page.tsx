import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-xl space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Payment System</h1>
        <p className="text-muted-foreground">
          Gestioná los cobros mensuales de tus clientes y dales acceso a un portal de autogestión
          para ver vencimientos y pagar online.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/portal"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
          >
            Portal cliente
          </Link>
        </div>
      </div>
    </main>
  );
}
