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
      <Text style={styles.h1}>Tu factura está vencida</Text>
      <Text style={styles.p}>
        Hola {clientName}, tu factura por <strong>{description}</strong> venció el{" "}
        <strong style={{ color: "#fff" }}>{due}</strong> (
        {daysOverdue} día{daysOverdue === 1 ? "" : "s"} atrás).
      </Text>
      <Section style={styles.calloutDanger}>
        <Text style={styles.metaLabel}>Monto adeudado</Text>
        <Text style={styles.amount}>{usd}</Text>
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={portalUrl} style={styles.button}>
          Regularizar ahora →
        </Button>
      </Section>
      <Text style={styles.small}>
        Si ya pagaste y el sistema no lo reflejó, respondé este mail y lo destrabamos.
      </Text>
    </EmailShell>
  );
}
