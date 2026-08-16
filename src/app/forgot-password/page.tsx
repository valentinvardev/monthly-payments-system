import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ForgotForm } from "./_components/ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      title="¿Olvidaste tu contraseña?"
      subtitle="Te mandamos un link a tu mail para que la reestablezcas."
      footer={
        <Link
          href="/login"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-white"
        >
          ← Volver al acceso
        </Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
