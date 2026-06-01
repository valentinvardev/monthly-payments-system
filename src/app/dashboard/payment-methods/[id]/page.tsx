import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { MethodForm } from "../_components/MethodForm";

export default async function EditMethodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let method;
  try {
    method = await api.paymentMethods.get({ id });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/payment-methods"
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
      >
        ← Volver a métodos
      </Link>

      <header className="reveal">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          Editar método
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-foreground">
          {method.label}
        </h1>
      </header>

      <div
        className="glass rounded-2xl p-6 reveal"
        style={{ animationDelay: "60ms" } as React.CSSProperties}
      >
        <MethodForm existing={method} />
      </div>
    </div>
  );
}
