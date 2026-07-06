import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

// Aviso al admin: el destinatario aceptó o rechazó el presupuesto.
export function QuoteDecidedEmail({
  name,
  title,
  totalUsd,
  accepted,
  reason,
  adminUrl,
}: {
  name: string;
  title: string;
  totalUsd: number;
  accepted: boolean;
  reason?: string | null;
  adminUrl: string;
}) {
  const usd = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalUsd);

  return (
    <EmailShell
      preview={`${name} ${accepted ? "ACEPTÓ" : "rechazó"} — ${title}`}
    >
      <Text style={styles.h1}>
        {accepted ? "¡Presupuesto aceptado! 🎉" : "Presupuesto rechazado 😕"}
      </Text>
      <Text style={styles.p}>
        <strong>{name}</strong> {accepted ? "aceptó" : "rechazó"} el presupuesto{" "}
        <strong>{title}</strong> por {usd}.
      </Text>
      {!accepted && reason && (
        <Section style={styles.callout}>
          <Text style={styles.metaLabel}>Motivo</Text>
          <Text style={styles.metaValue}>{reason}</Text>
        </Section>
      )}
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={adminUrl} style={styles.button}>
          {accepted ? "Convertir en factura →" : "Ver en el panel →"}
        </Button>
      </Section>
    </EmailShell>
  );
}
