import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Acceso"
      title="Entrá a tu cuenta"
      subtitle="Clientes y equipo entran por acá."
      footer={
        <Link
          href="/forgot-password"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-white"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      }
    >
      <Suspense fallback={<div className="h-32" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
