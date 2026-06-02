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
      <Text style={styles.h1}>Recibimos tu pago ⏳</Text>
      <Text style={styles.p}>
        Hola {clientName}, registramos tu pago por <strong>{description}</strong> vía{" "}
        {methodLabel}. Lo estamos revisando — apenas se confirme, te avisamos por mail y la
        factura aparece como pagada en tu portal.
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaLabel}>Monto</Text>
        <Text style={styles.amount}>{usd}</Text>
        <Text style={styles.metaValue}>
          Método: <strong style={{ color: "#fff" }}>{methodLabel}</strong>
        </Text>
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={portalUrl} style={styles.button}>
          Ver mi factura →
        </Button>
      </Section>
    </EmailShell>
  );
}
