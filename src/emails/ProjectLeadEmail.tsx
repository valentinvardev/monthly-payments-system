import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

// Aviso al admin: entró un lead por /contanos. Lista todas las respuestas
// del formulario ya traducidas a labels en español (el admin es Valentin).
export function ProjectLeadEmail({
  name,
  email,
  company,
  answers,
  adminUrl,
}: {
  name: string;
  email: string;
  company?: string | null;
  answers: { label: string; value: string }[];
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`Nuevo lead: ${name}${company ? ` (${company})` : ""}`}>
      <Text style={styles.h1}>Nuevo proyecto en la puerta 🚪</Text>
      <Text style={styles.p}>
        <strong>{name}</strong>
        {company ? ` de ${company}` : ""} completó el formulario de contacto. Su email:{" "}
        <strong>{email}</strong>.
      </Text>
      <Section style={styles.callout}>
        {answers.map((a) => (
          <Text key={a.label} style={{ ...styles.metaValue, margin: "6px 0" }}>
            <span style={{ opacity: 0.65 }}>{a.label}:</span>{" "}
            <strong style={{ color: "#fff" }}>{a.value}</strong>
          </Text>
        ))}
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={adminUrl} style={styles.button}>
          Ver en el panel →
        </Button>
      </Section>
      <Text style={styles.small}>
        Respondele directo a {email} — cuanto antes, mejor convierte.
      </Text>
    </EmailShell>
  );
}
