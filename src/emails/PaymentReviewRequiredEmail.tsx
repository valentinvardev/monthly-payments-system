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
        <strong>{clientName}</strong> reportó un pago de{" "}
        <strong>{description}</strong> y subió un comprobante. Confirmá o rechazá desde el
        dashboard.
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
          Método: <strong style={{ color: "#fff" }}>{methodLabel}</strong>
        </Text>
        {notes && (
          <Text style={{ ...styles.small, margin: "8px 0 0", fontStyle: "italic" }}>
            Notas: "{notes}"
          </Text>
        )}
      </Section>
      <Section style={{ margin: "20px 0" }}>
        <Button href={adminUrl} style={styles.button}>
          Revisar en el dashboard
        </Button>
      </Section>
      {proofUrl && (
        <Text style={{ ...styles.small, wordBreak: "break-all" }}>
          Comprobante: {proofUrl}
        </Text>
      )}
    </EmailShell>
  );
}
