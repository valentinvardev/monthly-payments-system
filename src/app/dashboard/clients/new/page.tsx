import Link from "next/link";
import { NewClientForm } from "./_components/NewClientForm";

export default function NewClientPage() {
  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
      >
        ← Volver a clientes
      </Link>

      <header className="reveal">
        <p className="studio-eyebrow">
          Nuevo cliente
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Agregar a tu <span className="font-light text-foreground/70">cartera</span>.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cargá los datos del cliente. Después podés generar un link de invitación al portal y
          definir un plan recurrente desde su página de gestión.
        </p>
      </header>

      <div
        className="glass rounded-2xl p-6 reveal"
        style={{ animationDelay: "60ms" } as React.CSSProperties}
      >
        <NewClientForm />
      </div>
    </div>
  );
}
