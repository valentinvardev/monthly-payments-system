import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function InviteEmail({
  clientName,
  inviteUrl,
  expiresAt,
}: {
  clientName: string;
  inviteUrl: string;
  expiresAt: Date;
}) {
  const expires = expiresAt.toLocaleString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <EmailShell preview={`Activá tu acceso al portal de Surcodia`}>
      <Text style={styles.h1}>Hola {clientName},</Text>
      <Text style={styles.p}>
        Te invitamos a acceder a tu portal de Surcodia para ver tus facturas y registrar tus
        pagos.
      </Text>
      <Text style={styles.p}>
        Tocá el botón para crear tu contraseña y entrar:
      </Text>
      <Section style={{ margin: "20px 0" }}>
        <Button href={inviteUrl} style={styles.button}>
          Activar mi cuenta
        </Button>
      </Section>
      <Text style={styles.small}>
        El link expira el <strong>{expires}</strong>. Si se te vence, pedile al administrador
        que te genere uno nuevo.
      </Text>
      <Text style={{ ...styles.small, marginTop: "16px", wordBreak: "break-all" }}>
        Si el botón no funciona, copiá y pegá esta URL en el navegador:
        <br />
        {inviteUrl}
      </Text>
    </EmailShell>
  );
}
