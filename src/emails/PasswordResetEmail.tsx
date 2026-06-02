import { Button, Section, Text } from "@react-email/components";
import { EmailShell, styles } from "./_shell";

// Used for the Supabase Auth recovery flow.
//
// Supabase has its own send pipeline for recovery emails — to use this
// template, copy the rendered HTML and paste it into Supabase Dashboard
// → Authentication → Email Templates → Reset Password. Replace the
// resetUrl placeholder with {{ .ConfirmationURL }} where indicated.
export function PasswordResetEmail({
  resetUrl,
  email,
}: {
  resetUrl: string;
  email?: string;
}) {
  return (
    <EmailShell preview="Reestablecé tu contraseña de Surcodia">
      <Text style={styles.h1}>Reestablecé tu contraseña 🔐</Text>
      <Text style={styles.p}>
        Recibimos un pedido para reestablecer la contraseña{email ? ` de ${email}` : ""}. Si
        fuiste vos, tocá el botón para elegir una nueva.
      </Text>
      <Section style={{ margin: "26px 0 18px" }}>
        <Button href={resetUrl} style={styles.button}>
          Elegir nueva contraseña →
        </Button>
      </Section>
      <Text style={styles.small}>
        Si no pediste este cambio, ignorá este mail — tu contraseña actual sigue siendo
        válida.
      </Text>
      <Text style={{ ...styles.small, marginTop: "18px", wordBreak: "break-all" }}>
        Si el botón no funciona, copiá y pegá esta URL en tu navegador:
        <br />
        <span style={{ color: "rgba(232,237,245,0.75)" }}>{resetUrl}</span>
      </Text>
    </EmailShell>
  );
}
