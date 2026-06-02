import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

export function OverdueEmail({
  clientName,
  description,
  amountUsd,
  dueDate,
  daysOverdue,
  portalUrl,
}: {
  clientName: string;
  description: string;
  amountUsd: number;
  dueDate: Date;
  daysOverdue: number;
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
    <EmailShell preview={`Factura vencida — ${description}`}>
      <Text style={styles.h1}>Factura vencida</Text>
      <Text style={styles.p}>
        Hola {clientName}, tu factura por <strong>{description}</strong> venció el{" "}
        <strong>{due}</strong> ({daysOverdue} día{daysOverdue === 1 ? "" : "s"} atrás).
      </Text>
      <Section
        style={{
          backgroundColor: "rgba(244, 63, 94, 0.10)",
          border: "1px solid rgba(244, 63, 94, 0.25)",
          borderRadius: "12px",
          padding: "16px",
          margin: "18px 0",
        }}
      >
        <Text style={{ ...styles.small, margin: 0 }}>Monto adeudado</Text>
        <Text style={styles.amount}>{usd}</Text>
      </Section>
      <Section style={{ margin: "20px 0" }}>
        <Button href={portalUrl} style={styles.button}>
          Regularizar ahora
        </Button>
      </Section>
      <Text style={styles.small}>
        Si ya pagaste y no se reflejó, respondé este mail o escribinos por privado.
      </Text>
    </EmailShell>
  );
}
