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
    <EmailShell preview={`${clientName}, activá tu acceso al portal de Surcodia`}>
      <Text style={styles.h1}>Hola {clientName} 👋</Text>
      <Text style={styles.p}>
        Te invitamos a activar tu portal de Surcodia para ver tus facturas y registrar tus
        pagos en un solo lugar.
      </Text>
      <Text style={styles.p}>Tocá el botón y elegí tu contraseña en menos de un minuto:</Text>
      <Section style={{ margin: "26px 0 18px" }}>
        <Button href={inviteUrl} style={styles.button}>
          Activar mi cuenta →
        </Button>
      </Section>
      <Text style={styles.small}>
        El link expira el <strong style={{ color: "#ffffff" }}>{expires}</strong>. Si se vence,
        pedile al administrador que te genere uno nuevo.
      </Text>
      <Text style={{ ...styles.small, marginTop: "18px", wordBreak: "break-all" }}>
        Si el botón no funciona, copiá y pegá esta URL en tu navegador:
        <br />
        <span style={{ color: "rgba(232,237,245,0.75)" }}>{inviteUrl}</span>
      </Text>
    </EmailShell>
  );
}
