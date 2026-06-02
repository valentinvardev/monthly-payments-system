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
    <EmailShell preview={`Nueva factura — ${description} (${usd})`}>
      <Text style={styles.h1}>Tenés una nueva factura</Text>
      <Text style={styles.p}>
        Hola {clientName}, te emitimos una factura por <strong>{description}</strong>. Acá los
        detalles:
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaLabel}>Monto</Text>
        <Text style={styles.amount}>{usd}</Text>
        <Text style={styles.metaValue}>
          Vence: <strong style={{ color: "#fff" }}>{due}</strong>
        </Text>
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={portalUrl} style={styles.button}>
          Ver y pagar →
        </Button>
      </Section>
      <Text style={styles.small}>
        Podés pagarla por Mercado Pago, transferencia bancaria o crypto desde tu portal.
      </Text>
    </EmailShell>
  );
}
