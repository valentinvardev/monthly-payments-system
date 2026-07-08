import { Suspense } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
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
          <div className="float-soft mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <BrandMark size={40} />
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
            Surcodia
          </h1>
        </header>

        <Suspense fallback={<div className="h-32" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
          >
            ¿olvidaste tu contraseña?
          </Link>
        </div>

        <footer className="mt-6 text-center text-[9px] uppercase tracking-[0.24em] text-muted-foreground/50">
          surcodia · {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}
