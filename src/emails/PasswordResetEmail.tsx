import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

// Link de recuperación de contraseña. Lo genera el server con la clave
// de servicio de Supabase y lo manda Resend (ver lib/password-reset.ts):
// ya no depende del mail por defecto de Supabase.
export function PasswordResetEmail({
  resetUrl,
  name,
}: {
  resetUrl: string;
  name?: string;
}) {
  const first = name?.trim().split(/\s+/)[0];

  return (
    <EmailShell preview="Elegí una contraseña nueva para tu cuenta de Surcodia">
      <Text style={styles.h1}>Contraseña nueva</Text>
      <Text style={styles.p}>
        {first ? `Hola, ${first}.` : "Hola."} Recibimos un pedido para cambiar la contraseña de tu
        cuenta. Tocá el botón y elegí una nueva; después entrás con ella como siempre.
      </Text>
      <Section style={{ margin: "26px 0 18px" }}>
        <Button href={resetUrl} style={styles.button}>
          Elegir contraseña nueva →
        </Button>
      </Section>
      <Text style={styles.small}>
        El link sirve una sola vez y vence en 24 horas. Si se venció, pedí otro desde «¿Olvidaste
        tu contraseña?» en la pantalla de acceso.
      </Text>
      <Text style={{ ...styles.small, marginTop: "10px" }}>
        Si no fuiste vos, ignorá este mail: tu contraseña actual sigue igual y nadie puede cambiarla
        sin este link.
      </Text>
      <Text style={{ ...styles.small, marginTop: "18px", wordBreak: "break-all" }}>
        Si el botón no funciona, copiá y pegá esta dirección en tu navegador:
        <br />
        <span style={{ color: "rgba(250,250,250,0.75)" }}>{resetUrl}</span>
      </Text>
    </EmailShell>
  );
}
