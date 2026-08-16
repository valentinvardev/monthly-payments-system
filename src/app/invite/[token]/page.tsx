import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/AuthShell";
import { InviteForm } from "./_components/InviteForm";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { client: true },
  });

  if (!invite) notFound();

  // If the client already registered (invite used or client has a linked
  // login), this link has no useful action left — bounce them to /login
  // pre-filled with their email so they can sign in normally.
  if (invite.usedAt !== null || invite.client.userId !== null) {
    redirect(`/login?email=${encodeURIComponent(invite.client.email)}&msg=already_registered`);
  }

  const expired = invite.expiresAt.getTime() < Date.now();

  return (
    <AuthShell
      eyebrow="Invitación"
      title="Activá tu cuenta"
      subtitle="Elegí una contraseña y entrás al portal donde vas a ver y pagar tus facturas."
    >
      {expired ? (
        <div className="border border-rose-400/30 bg-rose-400/[0.08] p-5 text-sm text-rose-200">
          Este link de invitación está vencido.
          <p className="mt-2 text-xs text-rose-200/70">
            Pedile al administrador que te genere uno nuevo.
          </p>
        </div>
      ) : (
        <>
          <dl className="mb-5 border border-white/10 bg-white/[0.02] p-4 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="studio-label">Cuenta</dt>
              <dd className="min-w-0 truncate text-white/85">{invite.client.fullName}</dd>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-4">
              <dt className="studio-label">Email</dt>
              <dd className="min-w-0 truncate font-mono text-[13px] text-white/85">
                {invite.client.email}
              </dd>
            </div>
          </dl>
          <InviteForm token={token} email={invite.client.email} />
        </>
      )}
    </AuthShell>
  );
}
