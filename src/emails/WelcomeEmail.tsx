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
      <Text style={styles.h1}>Bienvenido, {clientName}</Text>
      <Text style={styles.p}>
        Tu cuenta de Surcodia ya está activa. Desde tu portal podés:
      </Text>
      <Section style={{ margin: "12px 0" }}>
        <Text style={{ ...styles.p, margin: "4px 0" }}>
          • Ver tus facturas pendientes, vencidas o pagadas.
        </Text>
        <Text style={{ ...styles.p, margin: "4px 0" }}>
          • Pagar online con Mercado Pago al instante.
        </Text>
        <Text style={{ ...styles.p, margin: "4px 0" }}>
          • Hacer transferencias bancarias o enviar crypto y subir el comprobante.
        </Text>
        <Text style={{ ...styles.p, margin: "4px 0" }}>
          • Recibir recordatorios automáticos antes del vencimiento.
        </Text>
      </Section>
      <Section style={{ margin: "20px 0" }}>
        <Button href={portalUrl} style={styles.button}>
          Entrar al portal
        </Button>
      </Section>
      <Text style={styles.small}>
        Si tenés alguna duda, respondé este mail y te contestamos.
      </Text>
    </EmailShell>
  );
}
