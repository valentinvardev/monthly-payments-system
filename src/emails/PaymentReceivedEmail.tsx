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
    <EmailShell preview={`Pago confirmado — ${description}`}>
      <Text style={styles.h1}>¡Pago confirmado! ✓</Text>
      <Text style={styles.p}>
        Hola {clientName}, confirmamos tu pago por <strong>{description}</strong>. La factura
        quedó marcada como pagada en tu portal.
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaLabel}>Monto</Text>
        <Text style={styles.amount}>{usd}</Text>
        {externalId && (
          <Text style={{ ...styles.metaValue, marginTop: "8px" }}>
            ID Mercado Pago:{" "}
            <span
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                color: "rgba(250,250,250,0.85)",
              }}
            >
              {externalId}
            </span>
          </Text>
        )}
      </Section>
      <Text style={styles.p}>Gracias por estar al día.</Text>
    </EmailShell>
  );
}
