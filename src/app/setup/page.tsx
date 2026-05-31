import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/BrandMark";
import { SetupForm } from "./_components/SetupForm";

// One-time admin bootstrap. Disabled once a User with role=ADMIN exists.
export default async function SetupPage() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) redirect("/login?msg=setup_done");

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
        <header className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <BrandMark size={40} />
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
            Configurá tu admin
          </h1>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Esta pantalla solo aparece una vez: creá la cuenta de administrador y empezá a usar
            Surcodia.
          </p>
        </header>

        <SetupForm />
      </div>
    </main>
  );
}
