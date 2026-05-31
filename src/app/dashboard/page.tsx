import { api } from "@/trpc/server";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rate = await api.exchangeRate.usdToArs();

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Sesión: {user?.email ?? "anónimo"}</p>
        </header>

        <section className="rounded-lg border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Cotización USD → ARS</h2>
          <p className="mt-1 text-2xl font-semibold">${rate.rate} ARS</p>
          <p className="text-xs text-muted-foreground">
            fuente {rate.source} · actualizado {new Date(rate.fetchedAt).toLocaleString("es-AR")}
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Esto es el scaffold inicial (Fase 0). Próximas fases: CRUD de clientes, facturas, portal,
          emails y pasarelas de pago.
        </p>
      </div>
    </main>
  );
}
