import Link from "next/link";
import { MethodForm } from "../_components/MethodForm";

export default function NewMethodPage() {
  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/payment-methods"
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
      >
        ← Volver a métodos
      </Link>

      <header className="reveal">
        <p className="studio-eyebrow">
          Nuevo método de pago
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          Agregar <span className="font-light text-foreground/70">una forma de cobro</span>.
        </h1>
      </header>

      <div
        className="glass rounded-2xl p-6 reveal"
        style={{ animationDelay: "60ms" } as React.CSSProperties}
      >
        <MethodForm />
      </div>
    </div>
  );
}
