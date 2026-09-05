import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { peekPasswordReset } from "@/lib/password-reset-token";
import { ResetForm } from "./_components/ResetForm";

const DEAD: Record<"invalid" | "used" | "expired", { title: string; body: string }> = {
  invalid: {
    title: "Este link no es válido",
    body: "Puede estar incompleto o mal copiado. Pedí uno nuevo y usá el link entero.",
  },
  used: {
    title: "Este link ya se usó",
    body: "Cada link sirve una sola vez. Si no fuiste vos quien cambió la contraseña, pedí uno nuevo ahora.",
  },
  expired: {
    title: "Este link venció",
    body: "Los links duran 24 horas. Pedí uno nuevo y usalo dentro de ese plazo.",
  },
};

// El estado del token se decide en el server antes de mostrar nada: un
// link muerto no tiene que ver un formulario que no va a poder guardar.
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const status = await peekPasswordReset(token);

  if (status !== "valid") {
    const dead = DEAD[status];
    return (
      <AuthShell eyebrow="Recuperar acceso" title={dead.title} subtitle={dead.body}>
        <Link
          href="/forgot-password"
          className="studio-btn studio-btn-primary font-pixel flex w-full px-4 py-3 text-[11px]"
        >
          Pedir un link nuevo
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      title="Elegí una contraseña nueva"
      subtitle="Tiene que tener al menos 8 caracteres. Después entrás con ella como siempre."
    >
      <ResetForm token={token} />
    </AuthShell>
  );
}
