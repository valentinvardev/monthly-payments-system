// Genera un link para que un usuario elija una contraseña nueva, y
// opcionalmente se lo manda por mail con la plantilla del sistema.
//
//   npx tsx --env-file=.env scripts/password-reset-link.ts <email>
//   npx tsx --env-file=.env scripts/password-reset-link.ts <email> --send
//   npx tsx --env-file=.env scripts/password-reset-link.ts <email> --app-url https://surcodia.com
//
// Es lo mismo que hace el botón «Generar link» de la ficha del cliente,
// para cuando no hay un panel a mano. Con --app-url el link apunta a
// producción aunque el .env local diga localhost.
//
// Corre con tsx porque el cliente de Prisma 7 se emite en TypeScript.
// No importa lib/email ni lib/password-reset porque están marcados
// server-only y no cargan fuera de Next; el envío se replica acá en las
// pocas líneas que son.
import { render } from "@react-email/render";
import { Resend } from "resend";
import { prisma } from "../src/lib/prisma";
import { createPasswordResetLink } from "../src/lib/password-reset-token";
import { PasswordResetEmail } from "../src/emails/PasswordResetEmail";

async function main() {
  const args = process.argv.slice(2);
  const email = args.find((a) => !a.startsWith("--"))?.trim().toLowerCase();
  const send = args.includes("--send");
  const appUrlIdx = args.indexOf("--app-url");
  const appUrl = appUrlIdx >= 0 ? args[appUrlIdx + 1] : process.env.APP_URL;
  if (!email) throw new Error("uso: password-reset-link.ts <email> [--send] [--app-url <url>]");
  if (!appUrl) throw new Error("falta APP_URL (o --app-url)");

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true, email: true, role: true },
  });
  if (!user) throw new Error(`no hay usuario con el mail ${email}`);

  const { url, expiresAt } = await createPasswordResetLink(user.id, appUrl);
  console.log(`usuario:  ${user.fullName ?? "(sin nombre)"} <${user.email}> · ${user.role}`);
  console.log(`vence:    ${expiresAt.toLocaleString("es-AR")}`);
  console.log(`link:     ${url}`);

  if (!send) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no está en el .env");
  const subject = "Elegí una contraseña nueva para Surcodia";
  const html = await render(PasswordResetEmail({ resetUrl: url, name: user.fullName ?? undefined }));
  const res = await new Resend(apiKey).emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: user.email,
    subject,
    html,
  });
  await prisma.emailLog.create({
    data: {
      kind: "PASSWORD_RESET",
      toEmail: user.email,
      subject,
      providerId: res.data?.id ?? null,
      error: res.error ? String(res.error.message ?? res.error) : null,
    },
  });
  console.log(res.error ? `mail:     FALLÓ (${res.error.message})` : `mail:     enviado (${res.data?.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
