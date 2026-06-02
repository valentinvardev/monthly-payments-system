import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function ReminderBeforeDueEmail({
  clientName,
  description,
  amountUsd,
  dueDate,
  daysUntil,
  portalUrl,
}: {
  clientName: string;
  description: string;
  amountUsd: number;
  dueDate: Date;
  daysUntil: number;
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
  });

  const headline =
    daysUntil === 0
      ? "Vence hoy"
      : daysUntil === 1
        ? "Vence mañana"
        : `Vence en ${daysUntil} días`;

  return (
    <EmailShell preview={`Recordatorio: ${description} — ${headline}`}>
      <Text style={styles.h1}>{headline}</Text>
      <Text style={styles.p}>
        Hola {clientName}, tu factura por <strong>{description}</strong> vence el{" "}
        <strong>{due}</strong>.
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
      <Section style={{ margin: "20px 0" }}>
        <Button href={portalUrl} style={styles.button}>
          Pagar ahora
        </Button>
      </Section>
    </EmailShell>
  );
}
