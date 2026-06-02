import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function WelcomeEmail({
  clientName,
  portalUrl,
}: {
  clientName: string;
  portalUrl: string;
}) {
  return (
    <EmailShell preview={`Bienvenido a Surcodia, ${clientName}`}>
      <Text style={styles.h1}>Bienvenido, {clientName} ✨</Text>
      <Text style={styles.p}>
        Tu cuenta de Surcodia ya está activa. Desde tu portal vas a poder:
      </Text>
      <Section style={{ ...styles.callout, padding: "20px 22px" }}>
        <Text style={{ ...styles.p, margin: "0 0 8px" }}>
          → Ver tus facturas pendientes, vencidas o pagadas.
        </Text>
        <Text style={{ ...styles.p, margin: "0 0 8px" }}>
          → Pagar online con <strong style={{ color: "#fff" }}>Mercado Pago</strong> al
          instante.
        </Text>
        <Text style={{ ...styles.p, margin: "0 0 8px" }}>
          → Mandar transferencias bancarias o crypto y subir el comprobante.
        </Text>
        <Text style={{ ...styles.p, margin: 0 }}>
          → Recibir recordatorios automáticos antes de cada vencimiento.
        </Text>
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={portalUrl} style={styles.button}>
          Entrar al portal →
        </Button>
      </Section>
      <Text style={styles.small}>
        Si necesitás algo, respondé este mail y te respondemos directo.
      </Text>
    </EmailShell>
  );
}
