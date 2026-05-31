import "server-only";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User as DbUser } from "@/generated/prisma/client";

// Read the current Supabase session and return the matching Prisma User
// row. Returns null when there's no session OR when the auth user has no
// User record yet (e.g. tried to sign in before the admin invited them).
export async function getCurrentUser(): Promise<DbUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({
    where: { authUserId: authUser.id },
  });
}

export async function requireUser(): Promise<DbUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}
