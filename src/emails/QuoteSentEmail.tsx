import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

// Presupuesto enviado al prospecto/cliente, con el link público para
// verlo y decidir. Bilingüe según Quote.locale.
export function QuoteSentEmail({
  name,
  title,
  totalUsd,
  quoteUrl,
  validUntil,
  locale,
}: {
  name: string;
  title: string;
  totalUsd: number;
  quoteUrl: string;
  validUntil?: Date | null;
  locale: "es" | "en";
}) {
  const usd = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalUsd);
  const validez = validUntil
    ? validUntil.toLocaleDateString(locale === "en" ? "en-US" : "es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  if (locale === "en") {
    return (
      <EmailShell preview={`Your proposal is ready — ${title}`}>
        <Text style={styles.h1}>Your proposal is ready 📋</Text>
        <Text style={styles.p}>
          Hi {name}, we put together the proposal for <strong>{title}</strong>. You can
          review every item and accept (or decline) right from the link below.
        </Text>
        <Section style={styles.callout}>
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={styles.amount}>{usd}</Text>
          {validez && (
            <Text style={styles.metaValue}>
              Valid until <strong style={{ color: "#fff" }}>{validez}</strong>
            </Text>
          )}
        </Section>
        <Section style={{ margin: "22px 0 18px" }}>
          <Button href={quoteUrl} style={styles.button}>
            View proposal →
          </Button>
        </Section>
        <Text style={styles.small}>
          Questions? Reply to this email and we&apos;ll get back to you today.
        </Text>
      </EmailShell>
    );
  }

  return (
    <EmailShell preview={`Tu presupuesto está listo — ${title}`}>
      <Text style={styles.h1}>Tu presupuesto está listo 📋</Text>
      <Text style={styles.p}>
        Hola {name}, armamos el presupuesto de <strong>{title}</strong>. Podés revisar
        cada ítem y aceptarlo (o rechazarlo) directo desde el link.
      </Text>
      <Section style={styles.callout}>
        <Text style={styles.metaLabel}>Total</Text>
        <Text style={styles.amount}>{usd}</Text>
        {validez && (
          <Text style={styles.metaValue}>
            Válido hasta el <strong style={{ color: "#fff" }}>{validez}</strong>
          </Text>
        )}
      </Section>
      <Section style={{ margin: "22px 0 18px" }}>
        <Button href={quoteUrl} style={styles.button}>
          Ver presupuesto →
        </Button>
      </Section>
      <Text style={styles.small}>
        ¿Dudas? Respondé este mail y te contestamos en el día.
      </Text>
    </EmailShell>
  );
}
