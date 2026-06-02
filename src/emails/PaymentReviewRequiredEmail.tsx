import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function PaymentReviewRequiredEmail({
  clientName,
  description,
  amountUsd,
  method,
  notes,
  proofUrl,
  adminUrl,
}: {
  clientName: string;
  description: string;
  amountUsd: number;
  method: "BANK_TRANSFER" | "CRYPTO";
  notes?: string | null;
  proofUrl?: string | null;
  adminUrl: string;
}) {
  const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountUsd);
  const methodLabel = method === "BANK_TRANSFER" ? "Transferencia bancaria" : "Crypto";

  return (
    <EmailShell preview={`${clientName} envió un pago para revisar`}>
      <Text style={styles.h1}>Comprobante pendiente de confirmar</Text>
      <Text style={styles.p}>
        <strong style={{ color: "#fff" }}>{clientName}</strong> reportó un pago de{" "}
        <strong>{description}</strong> y subió un comprobante.
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaLabel}>Monto</Text>
        <Text style={styles.amount}>{usd}</Text>
        <Text style={styles.metaValue}>
          Método: <strong style={{ color: "#fff" }}>{methodLabel}</strong>
        </Text>
        {notes && (
          <Text
            style={{
              ...styles.metaValue,
              marginTop: "10px",
              fontStyle: "italic",
              color: "rgba(232,237,245,0.65)",
            }}
          >
            "{notes}"
          </Text>
        )}
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={adminUrl} style={styles.button}>
          Revisar en el dashboard →
        </Button>
      </Section>
      {proofUrl && (
        <Text style={{ ...styles.small, wordBreak: "break-all" }}>
          Comprobante:{" "}
          <a
            href={proofUrl}
            style={{ color: "rgba(232,237,245,0.75)", textDecoration: "underline" }}
          >
            {proofUrl}
          </a>
        </Text>
      )}
    </EmailShell>
  );
}
