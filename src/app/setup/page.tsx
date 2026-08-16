import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/AuthShell";
import { SetupForm } from "./_components/SetupForm";

// One-time admin bootstrap. Disabled once a User with role=ADMIN exists.
export default async function SetupPage() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) redirect("/login?msg=setup_done");

  return (
    <AuthShell
      eyebrow="Puesta en marcha"
      title="Configurá tu admin"
      subtitle="Esta pantalla aparece una sola vez: creá la cuenta de administrador y empezá a usar Surcodia."
    >
      <SetupForm />
    </AuthShell>
  );
}
