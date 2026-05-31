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
          <p className="mt-1.5 text-sm text-muted-foreground">
            Cobros mensuales tan claros como un día austral.
          </p>
        </header>

        <LoginForm />

        <footer className="mt-7 text-center text-[9px] uppercase tracking-[0.24em] text-muted-foreground/50">
          glaciar · sur · {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}
