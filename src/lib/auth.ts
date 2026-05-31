import { cookies } from "next/headers";
import { store } from "@/lib/demo/store";
import type { DemoUser } from "@/lib/demo/types";

export const DEMO_COOKIE = "demo_user_id";

export async function getCurrentUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(DEMO_COOKIE)?.value;
  if (!id) return null;
  return store().users.find((u) => u.id === id) ?? null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export function getUserFromCookieHeader(cookieHeader: string | null): DemoUser | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(/;\s*/)
    .map((p) => p.split("="))
    .find(([k]) => k === DEMO_COOKIE);
  if (!match) return null;
  const id = decodeURIComponent(match[1] ?? "");
  if (!id) return null;
  return store().users.find((u) => u.id === id) ?? null;
}

export function listDemoUsers() {
  return store().users;
}
