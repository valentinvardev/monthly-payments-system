import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

// Shared shell used by every transactional email so they share the same
// neutral, sober look: dark navy canvas, off-white text, the brand
// wordmark, and a footer.
export function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brand}>
            <Text style={brandText}>Surcodia</Text>
          </Section>
          <Section style={card}>{children}</Section>
          <Hr style={hr} />
          <Section>
            <Text style={footerText}>
              Recibís este mail porque tu cuenta está vinculada a Surcodia. Si no esperabas este
              mensaje, ignoralo.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#0d1320",
  margin: 0,
  padding: "32px 0",
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#e6ebf3",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "0 24px",
};

const brand: React.CSSProperties = {
  paddingBottom: "12px",
};

const brandText: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  letterSpacing: "0.02em",
  fontWeight: 600,
  color: "#ffffff",
};

const card: React.CSSProperties = {
  backgroundColor: "#162033",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "28px",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  margin: "24px 0 16px",
};

const footerText: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  lineHeight: "16px",
  color: "rgba(230,235,243,0.5)",
};

export const styles = {
  h1: {
    margin: "0 0 12px",
    fontSize: "22px",
    lineHeight: "30px",
    fontWeight: 600,
    color: "#ffffff",
  } as React.CSSProperties,
  p: {
    margin: "0 0 12px",
    fontSize: "14px",
    lineHeight: "22px",
    color: "rgba(230,235,243,0.85)",
  } as React.CSSProperties,
  small: {
    margin: "0",
    fontSize: "12px",
    lineHeight: "18px",
    color: "rgba(230,235,243,0.55)",
  } as React.CSSProperties,
  button: {
    display: "inline-block",
    backgroundColor: "#ffffff",
    color: "#0d1320",
    padding: "12px 22px",
    borderRadius: "9999px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  } as React.CSSProperties,
  amount: {
    fontSize: "32px",
    fontWeight: 300,
    color: "#ffffff",
    margin: "8px 0",
  } as React.CSSProperties,
};
