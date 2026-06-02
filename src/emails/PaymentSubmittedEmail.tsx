import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function PaymentSubmittedEmail({
  clientName,
  description,
  amountUsd,
  method,
  portalUrl,
}: {
  clientName: string;
  description: string;
  amountUsd: number;
  method: "BANK_TRANSFER" | "CRYPTO";
  portalUrl: string;
}) {
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountUsd);
  const methodLabel = method === "BANK_TRANSFER" ? "transferencia bancaria" : "crypto";

  return (
    <EmailShell preview={`Recibimos tu pago — ${description}`}>
      <Text style={styles.h1}>Recibimos tu pago</Text>
      <Text style={styles.p}>
        Hola {clientName}, registramos tu pago por <strong>{description}</strong> vía{" "}
        {methodLabel}. Lo estamos revisando.
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
      </Section>
      <Text style={styles.p}>
        Te vamos a avisar por mail cuando la confirmación termine. La factura va a quedar como
        pagada en tu portal.
      </Text>
      <Section style={{ margin: "20px 0" }}>
        <Button href={portalUrl} style={styles.button}>
          Ver mi factura
        </Button>
      </Section>
    </EmailShell>
  );
}
