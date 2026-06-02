import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function InvoiceCreatedEmail({
  clientName,
  description,
  amountUsd,
  dueDate,
  portalUrl,
}: {
  clientName: string;
  description: string;
  amountUsd: number;
  dueDate: Date;
  portalUrl: string;
}) {
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountUsd);
  const due = new Date(dueDate).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <EmailShell preview={`Nueva factura — ${description}`}>
      <Text style={styles.h1}>Tenés una nueva factura</Text>
      <Text style={styles.p}>
        Hola {clientName}, te emitimos una nueva factura por <strong>{description}</strong>.
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
        <Text style={{ ...styles.small, margin: "4px 0 0" }}>
          Vence: <strong style={{ color: "#fff" }}>{due}</strong>
        </Text>
      </Section>
      <Section style={{ margin: "20px 0" }}>
        <Button href={portalUrl} style={styles.button}>
          Ver y pagar
        </Button>
      </Section>
      <Text style={styles.small}>
        Entrá al portal con tu email y contraseña para pagarla por Mercado Pago, transferencia
        bancaria o crypto.
      </Text>
    </EmailShell>
  );
}
