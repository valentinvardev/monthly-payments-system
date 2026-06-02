import { Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function PaymentReceivedEmail({
  clientName,
  description,
  amountUsd,
  externalId,
}: {
  clientName: string;
  description: string;
  amountUsd: number;
  externalId?: string;
}) {
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountUsd);

  return (
    <EmailShell preview={`Pago recibido — ${description}`}>
      <Text style={styles.h1}>¡Pago recibido!</Text>
      <Text style={styles.p}>
        Hola {clientName}, confirmamos tu pago por <strong>{description}</strong>.
      </Text>
      <Section
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "16px",
          margin: "18px 0",
        }}
      >
        <Text style={{ ...styles.small, margin: 0 }}>Monto</Text>
        <Text style={styles.amount}>{usd}</Text>
        {externalId && (
          <Text style={{ ...styles.small, margin: "4px 0 0" }}>
            ID Mercado Pago: <span style={{ fontFamily: "monospace" }}>{externalId}</span>
          </Text>
        )}
      </Section>
      <Text style={styles.p}>Gracias por estar al día. La factura quedó marcada como pagada.</Text>
    </EmailShell>
  );
}
