import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Shared shell used by every transactional email so they share the same
// neutral, sober look: deep navy canvas, a refined Surcodia wordmark,
// content card with subtle border, and a quiet footer.
export function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="es">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark light" />
        <meta name="supported-color-schemes" content="dark light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brandSection}>
            <Text style={brandWordmark}>Surcodia</Text>
            <Text style={brandTagline}>cobros recurrentes simples</Text>
          </Section>

          <Section style={card}>{children}</Section>

          <Section style={footerSection}>
            <Text style={footerLine}>
              Recibís este mail porque tu cuenta está vinculada a Surcodia.
            </Text>
            <Text style={footerLine}>
              ¿Dudas? Respondé este mismo mail y te contestamos.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} ·{" "}
              <Link href="https://surcodia.com" style={footerLink}>
                surcodia.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#0a0f1c",
  margin: 0,
  padding: "40px 16px",
  fontFamily: SANS,
  color: "#e8edf5",
  WebkitFontSmoothing: "antialiased",
  // Gmail strips this; Apple Mail / desktop Outlook respect it.
  backgroundImage: "linear-gradient(180deg, #0a0f1c 0%, #0e1424 100%)",
};

const container: React.CSSProperties = {
  maxWidth: "580px",
  margin: "0 auto",
};

const brandSection: React.CSSProperties = {
  padding: "8px 8px 28px",
  textAlign: "center" as const,
};

const brandWordmark: React.CSSProperties = {
  margin: 0,
  fontFamily: SANS,
  fontSize: "30px",
  fontWeight: 700,
  letterSpacing: "-0.025em",
  lineHeight: "1.1",
  color: "#ffffff",
};

const brandTagline: React.CSSProperties = {
  margin: "8px 0 0",
  fontFamily: SANS,
  fontSize: "10px",
  fontWeight: 500,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  color: "rgba(232, 237, 245, 0.40)",
};

const card: React.CSSProperties = {
  backgroundColor: "#141b2e",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "20px",
  padding: "32px 28px",
  boxShadow: "0 12px 32px -16px rgba(0, 0, 0, 0.5)",
};

const footerSection: React.CSSProperties = {
  padding: "28px 8px 0",
  textAlign: "center" as const,
};

const footerLine: React.CSSProperties = {
  margin: "0 0 4px",
  fontFamily: SANS,
  fontSize: "12px",
  lineHeight: "1.5",
  color: "rgba(232, 237, 245, 0.40)",
};

const footerCopyright: React.CSSProperties = {
  margin: "14px 0 0",
  fontFamily: SANS,
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "rgba(232, 237, 245, 0.30)",
};

const footerLink: React.CSSProperties = {
  color: "rgba(232, 237, 245, 0.55)",
  textDecoration: "none",
};

// Re-export the SANS stack so individual templates can use it on their
// custom inline styles without duplicating the string.
export const FONT_STACK = SANS;

export const styles = {
  h1: {
    margin: "0 0 14px",
    fontFamily: SANS,
    fontSize: "24px",
    lineHeight: "1.25",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.015em",
  } as React.CSSProperties,

  p: {
    margin: "0 0 14px",
    fontFamily: SANS,
    fontSize: "15px",
    lineHeight: "1.6",
    color: "rgba(232, 237, 245, 0.85)",
  } as React.CSSProperties,

  small: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "12px",
    lineHeight: "1.55",
    color: "rgba(232, 237, 245, 0.55)",
  } as React.CSSProperties,

  // Pill-shaped CTA button with a strong contrast — white on dark.
  button: {
    display: "inline-block",
    backgroundColor: "#ffffff",
    color: "#0a0f1c",
    padding: "13px 26px",
    borderRadius: "12px",
    textDecoration: "none",
    fontFamily: SANS,
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "-0.005em",
    boxShadow: "0 4px 14px -4px rgba(255, 255, 255, 0.15)",
  } as React.CSSProperties,

  // Big amount display — used in InvoiceCreated / Reminder / Overdue / etc.
  amount: {
    margin: "8px 0",
    fontFamily: SANS,
    fontSize: "36px",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.025em",
    lineHeight: "1.15",
  } as React.CSSProperties,

  // Neutral callout — frames the key data point (amount, due date, etc.).
  callout: {
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: "14px",
    padding: "20px 22px",
    margin: "22px 0",
  } as React.CSSProperties,

  // Reserved for OverdueEmail.
  calloutDanger: {
    backgroundColor: "rgba(244, 63, 94, 0.07)",
    border: "1px solid rgba(244, 63, 94, 0.20)",
    borderRadius: "14px",
    padding: "20px 22px",
    margin: "22px 0",
  } as React.CSSProperties,

  // Smaller meta label that sits above the amount.
  metaLabel: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "rgba(232, 237, 245, 0.50)",
  } as React.CSSProperties,

  // Sub-line under the amount (date, ID, etc.).
  metaValue: {
    margin: "4px 0 0",
    fontFamily: SANS,
    fontSize: "13px",
    lineHeight: "1.5",
    color: "rgba(232, 237, 245, 0.78)",
  } as React.CSSProperties,
};
