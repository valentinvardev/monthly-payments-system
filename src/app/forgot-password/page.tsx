import { BrandMark } from "@/components/BrandMark";
import Link from "next/link";
import { ForgotForm } from "./_components/ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.45 0.08 215 / 0.5), transparent 70%)",
          }}
        />
      </div>

      <div className="glass-strong relative w-full max-w-md rounded-3xl p-8 reveal">
        <header className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <BrandMark size={40} />
          </div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Te mandamos un link a tu mail para que la reestablezcas.
          </p>
        </header>

        <ForgotForm />

        <footer className="mt-6 text-center">
          <Link
            href="/login"
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
          >
            ← volver al login
          </Link>
        </footer>
      </div>
    </main>
  );
}
