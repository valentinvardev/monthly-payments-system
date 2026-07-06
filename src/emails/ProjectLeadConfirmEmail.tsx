import { Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

// Auto-reply al lead que completó /contanos. Bilingüe según el idioma
// en el que navegaba el formulario.
export function ProjectLeadConfirmEmail({
  name,
  locale,
}: {
  name: string;
  locale: "es" | "en";
}) {
  if (locale === "en") {
    return (
      <EmailShell preview="We got your message — Surcodia Studio">
        <Text style={styles.h1}>Got it, {name} 👾</Text>
        <Text style={styles.p}>
          Thanks for telling us about your project. A real person (Valentin) reads every
          submission — you&apos;ll hear back within the day.
        </Text>
        <Section style={styles.callout}>
          <Text style={styles.metaValue}>
            Meanwhile, if you want to add anything, just reply to this email.
          </Text>
        </Section>
        <Text style={styles.small}>Surcodia Studio · software from the south.</Text>
      </EmailShell>
    );
  }
  return (
    <EmailShell preview="Recibimos tu consulta — Surcodia Studio">
      <Text style={styles.h1}>Recibido, {name} 👾</Text>
      <Text style={styles.p}>
        Gracias por contarnos tu proyecto. Esto lo lee una persona real (Valentin) — te
        respondemos dentro del día.
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaValue}>
          Mientras tanto, si querés agregar algo, respondé este mismo mail.
        </Text>
      </Section>
      <Text style={styles.small}>Surcodia Studio · software del sur.</Text>
    </EmailShell>
  );
}
