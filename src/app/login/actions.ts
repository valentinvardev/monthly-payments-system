"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE } from "@/lib/auth";
import { store } from "@/lib/demo/store";

export async function loginAsDemoUser(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const user = store().users.find((u) => u.id === userId);
  if (!user) throw new Error("Usuario demo no encontrado");

  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(user.role === "ADMIN" ? "/dashboard" : "/portal");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  redirect("/login");
}
