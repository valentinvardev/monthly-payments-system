"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z
  .object({
    email: z.string().email("Email inválido"),
    fullName: z.string().min(1, "Falta el nombre"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export type SetupResult = { ok: true } | { ok: false; error: string };

export async function createAdmin(formData: FormData): Promise<SetupResult> {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) return { ok: false, error: "Ya existe un administrador." };

  const parsed = schema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { email, fullName, password } = parsed.data;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    return { ok: false, error: `No pudimos crear el usuario: ${error?.message ?? "desconocido"}` };
  }

  try {
    await prisma.user.create({
      data: {
        authUserId: data.user.id,
        email,
        fullName,
        role: "ADMIN",
      },
    });
  } catch (e) {
    // Roll back the Supabase auth user so the form can be retried.
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => null);
    return {
      ok: false,
      error: `No pudimos persistir el admin en la DB: ${(e as Error).message}`,
    };
  }

  return { ok: true };
}
