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
      ? "Tu factura vence hoy"
      : daysUntil === 1
        ? "Tu factura vence mañana"
        : `Tu factura vence en ${daysUntil} días`;

  return (
    <EmailShell preview={`${headline} — ${description}`}>
      <Text style={styles.h1}>{headline}</Text>
      <Text style={styles.p}>
        Hola {clientName}, te recordamos que tu factura de <strong>{description}</strong> vence
        el <strong style={{ color: "#fff" }}>{due}</strong>.
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaLabel}>Monto</Text>
        <Text style={styles.amount}>{usd}</Text>
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={portalUrl} style={styles.button}>
          Pagar ahora →
        </Button>
      </Section>
      <Text style={styles.small}>
        Pagás online en menos de un minuto desde tu portal.
      </Text>
    </EmailShell>
  );
}
