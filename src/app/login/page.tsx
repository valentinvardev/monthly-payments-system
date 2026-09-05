import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./_components/LoginForm";

const NOTICES: Record<string, string> = {
  password_updated: "Contraseña guardada. Entrá con la nueva.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { msg } = await searchParams;
  const notice = msg ? NOTICES[msg] : undefined;

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
      {notice && (
        <div className="mb-4 border border-emerald-300/25 bg-emerald-300/[0.07] px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}
      <Suspense fallback={<div className="h-32" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
