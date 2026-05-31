import "server-only";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import type { User as DbUser } from "@/generated/prisma/client";

// Resolve the current session into our Prisma User record.
// On first login we auto-bootstrap the row:
//   - If the email matches ADMIN_EMAIL → create with role=ADMIN
//   - Otherwise look up a Client by email and link the User as CLIENT
//   - Else: signed in but no role yet — getCurrentUser returns null
//     (the route handler can decide what to do — e.g. show "tu acceso
//     todavía no está habilitado, hablá con el admin").
export async function getCurrentUser(): Promise<DbUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser?.email) return null;

  // Fast path: we already have a User row for this auth user.
  const existing = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
  });
  if (existing) return existing;

  // Bootstrap path: first time this auth user shows up.
  const email = authUser.email.toLowerCase();
  const isAdmin = email === env.ADMIN_EMAIL.toLowerCase();

  if (isAdmin) {
    return prisma.user.create({
      data: {
        authUserId: authUser.id,
        email: authUser.email,
        fullName: (authUser.user_metadata?.full_name as string | undefined) ?? "Admin",
        role: "ADMIN",
      },
    });
  }

  // CLIENT path: only valid if the admin previously created a Client with
  // this same email address (the invite flow will guarantee that).
  const client = await prisma.client.findUnique({ where: { email } });
  if (!client) return null;

  return prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        authUserId: authUser.id,
        email: authUser.email!,
        fullName: client.fullName,
        role: "CLIENT",
      },
    });
    await tx.client.update({
      where: { id: client.id },
      data: { userId: u.id },
    });
    return u;
  });
}

export async function requireUser(): Promise<DbUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}
