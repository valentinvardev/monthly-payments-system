import { AuthShell } from "@/components/AuthShell";
import { ResetForm } from "./_components/ResetForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      title="Elegí una nueva contraseña"
      subtitle="Tiene que tener al menos 8 caracteres."
    >
      <ResetForm />
    </AuthShell>
  );
}
