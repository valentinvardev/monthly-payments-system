import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/BrandMark";
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
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.45 0.08 215 / 0.5), transparent 70%)",
          }}
        />
      </div>

      <div className="glass-strong relative w-full max-w-md rounded-3xl p-8 reveal">
        <header className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <BrandMark size={40} />
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
            Bienvenido
          </h1>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Te invitamos a acceder al portal de Surcodia.
          </p>
        </header>

        {expired ? (
          <div className="rounded-2xl border border-rose-300/25 bg-rose-300/[0.08] p-5 text-sm text-rose-100/95">
            Este link de invitación está vencido.
            <p className="mt-2 text-xs text-rose-100/70">
              Pedile al administrador que te genere uno nuevo.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground/55 uppercase tracking-[0.14em] text-[10px]">
                  Cuenta
                </span>
                <span className="ml-2 text-foreground/85">{invite.client.fullName}</span>
              </p>
              <p className="mt-1">
                <span className="text-foreground/55 uppercase tracking-[0.14em] text-[10px]">
                  Email
                </span>
                <span className="ml-2 font-mono text-foreground/85">{invite.client.email}</span>
              </p>
            </div>
            <InviteForm token={token} email={invite.client.email} />
          </>
        )}
      </div>
    </main>
  );
}
