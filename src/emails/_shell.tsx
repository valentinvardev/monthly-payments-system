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
import { S_GRID } from "@/components/studio/pixel";

// Paleta del studio — los mismos valores que la landing.
const INK = "#0a0a0a"; // lienzo
const PANEL = "#0f0f0f"; // tarjeta
const BRAND = "#0070f3"; // acento accionable
const FROST = "#fafafa"; // texto principal
const LINE = "rgba(255, 255, 255, 0.12)"; // borde de un pixel

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif";

// Los eyebrows de la landing van en monoespaciada; en mail usamos la
// pila del sistema, que está instalada en todos lados.
const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', 'Courier New', monospace";

// ---------------------------------------------------------------
// Monograma pixel dibujado con celdas de tabla.
//
// Silkscreen no carga en los clientes de correo y una imagen remota
// queda bloqueada por defecto en Gmail y Outlook. Una tabla de celdas
// con fondo se ve idéntica en todos lados y no depende de nada — el
// mismo S_GRID que usa el SVG de la web, así que la marca no se
// bifurca.
// ---------------------------------------------------------------
const CELL = 4;

function PixelMonogram() {
  const cols = 9; // 7 del monograma + el pixel que se escapa a la derecha
  const cell = (bg: string, key: string) => (
    <td
      key={key}
      width={CELL}
      height={CELL}
      style={{
        width: `${CELL}px`,
        height: `${CELL}px`,
        backgroundColor: bg,
        fontSize: 0,
        lineHeight: 0,
        padding: 0,
        margin: 0,
      }}
    >
      &nbsp;
    </td>
  );

  const rows: React.ReactNode[] = [];

  // Fila 0: sólo el pixel azul que se despega del monograma.
  rows.push(
    <tr key="escape">
      {Array.from({ length: cols }, (_, c) =>
        cell(c === 8 ? BRAND : "transparent", `e-${c}`),
      )}
    </tr>,
  );

  // Filas 1..7: la S.
  S_GRID.forEach((row, r) => {
    rows.push(
      <tr key={`r-${r}`}>
        {Array.from({ length: cols }, (_, c) =>
          cell(row[c] === "1" ? FROST : "transparent", `${r}-${c}`),
        )}
      </tr>,
    );
  });

  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      border={0}
      role="presentation"
      style={{ borderCollapse: "collapse", borderSpacing: 0 }}
    >
      <tbody>{rows}</tbody>
    </table>
  );
}

// Shell compartido por todos los transaccionales: negro plano, el
// lockup pixel de la landing, tarjeta con borde de un pixel y un pie
// callado.
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
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Lockup: monograma + palabra + contexto, como en la web. */}
          <Section style={brandSection}>
            <table
              cellPadding={0}
              cellSpacing={0}
              border={0}
              role="presentation"
              style={{ borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "10px" }}>
                    <PixelMonogram />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <span style={brandWord}>surcodia</span>
                    <span style={brandContext}>studio</span>
                  </td>
                </tr>
              </tbody>
            </table>
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
  backgroundColor: INK,
  margin: 0,
  padding: "40px 16px",
  fontFamily: SANS,
  color: FROST,
  WebkitFontSmoothing: "antialiased",
};

const container: React.CSSProperties = {
  maxWidth: "580px",
  margin: "0 auto",
};

const brandSection: React.CSSProperties = {
  padding: "0 4px 26px",
};

const brandWord: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: "17px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: FROST,
};

const brandContext: React.CSSProperties = {
  marginLeft: "10px",
  fontFamily: SANS,
  fontSize: "9px",
  fontWeight: 500,
  letterSpacing: "0.38em",
  textTransform: "uppercase" as const,
  color: "rgba(250, 250, 250, 0.45)",
};

const card: React.CSSProperties = {
  backgroundColor: PANEL,
  border: `1px solid ${LINE}`,
  borderRadius: "8px",
  padding: "32px 28px",
};

const footerSection: React.CSSProperties = {
  padding: "26px 4px 0",
};

const footerLine: React.CSSProperties = {
  margin: "0 0 4px",
  fontFamily: SANS,
  fontSize: "12px",
  lineHeight: "1.55",
  color: "rgba(250, 250, 250, 0.40)",
};

const footerCopyright: React.CSSProperties = {
  margin: "14px 0 0",
  fontFamily: MONO,
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "rgba(250, 250, 250, 0.30)",
};

const footerLink: React.CSSProperties = {
  color: "rgba(250, 250, 250, 0.55)",
  textDecoration: "none",
};

// Re-export the SANS stack so individual templates can use it on their
// custom inline styles without duplicating the string.
export const FONT_STACK = SANS;
export const MONO_STACK = MONO;
export const BRAND_COLOR = BRAND;

export const styles = {
  h1: {
    margin: "0 0 14px",
    fontFamily: SANS,
    fontSize: "24px",
    lineHeight: "1.2",
    fontWeight: 600,
    color: FROST,
    letterSpacing: "-0.025em",
  } as React.CSSProperties,

  p: {
    margin: "0 0 14px",
    fontFamily: SANS,
    fontSize: "15px",
    lineHeight: "1.6",
    color: "rgba(250, 250, 250, 0.72)",
  } as React.CSSProperties,

  small: {
    margin: 0,
    fontFamily: SANS,
    fontSize: "12px",
    lineHeight: "1.55",
    color: "rgba(250, 250, 250, 0.50)",
  } as React.CSSProperties,

  // CTA del studio: azul de marca y esquinas rectas.
  button: {
    display: "inline-block",
    backgroundColor: BRAND,
    color: "#ffffff",
    padding: "13px 26px",
    borderRadius: "0",
    textDecoration: "none",
    fontFamily: SANS,
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "-0.005em",
  } as React.CSSProperties,

  // Big amount display — used in InvoiceCreated / Reminder / Overdue / etc.
  amount: {
    margin: "8px 0",
    fontFamily: SANS,
    fontSize: "36px",
    fontWeight: 600,
    color: FROST,
    letterSpacing: "-0.03em",
    lineHeight: "1.15",
  } as React.CSSProperties,

  // Callout neutro — enmarca el dato clave. Recto, como los bloques
  // de números de la landing.
  callout: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    borderRadius: "0",
    padding: "20px 22px",
    margin: "22px 0",
  } as React.CSSProperties,

  // Reserved for OverdueEmail.
  calloutDanger: {
    backgroundColor: "rgba(244, 82, 106, 0.08)",
    border: "1px solid rgba(244, 82, 106, 0.30)",
    borderRadius: "0",
    padding: "20px 22px",
    margin: "22px 0",
  } as React.CSSProperties,

  // Rótulo chico sobre el monto — mono y versalitas, como los
  // eyebrows de la web.
  metaLabel: {
    margin: 0,
    fontFamily: MONO,
    fontSize: "10px",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "rgba(250, 250, 250, 0.45)",
  } as React.CSSProperties,

  // Sub-line under the amount (date, ID, etc.).
  metaValue: {
    margin: "4px 0 0",
    fontFamily: SANS,
    fontSize: "13px",
    lineHeight: "1.5",
    color: "rgba(250, 250, 250, 0.75)",
  } as React.CSSProperties,
};
