import { createClient } from "@/lib/supabase/server";

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold">Portal del cliente</h1>
        <p className="text-sm text-muted-foreground">Sesión: {user?.email ?? "anónimo"}</p>
        <p className="text-sm">Acá vas a ver tus facturas y métodos de pago disponibles.</p>
      </div>
    </main>
  );
}
