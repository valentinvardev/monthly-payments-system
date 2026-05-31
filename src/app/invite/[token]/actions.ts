"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export type AcceptResult = { ok: true } | { ok: false; error: string };

export async function acceptInvite(formData: FormData): Promise<AcceptResult> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const invite = await prisma.invite.findUnique({
    where: { token: parsed.data.token },
    include: { client: true },
  });
  if (!invite) return { ok: false, error: "Invite no encontrado." };
  if (invite.usedAt) return { ok: false, error: "Este link ya fue usado." };
  if (invite.expiresAt.getTime() < Date.now())
    return { ok: false, error: "Este link está vencido." };
  if (invite.client.userId)
    return { ok: false, error: "Este cliente ya tiene acceso al portal." };

  const supabase = getSupabaseAdmin();

  // Auth user — email confirmed so the client can log in immediately.
  const { data, error } = await supabase.auth.admin.createUser({
    email: invite.client.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: invite.client.fullName, clientId: invite.client.id },
  });
  if (error || !data.user) {
    return {
      ok: false,
      error: `No pudimos crear el usuario: ${error?.message ?? "desconocido"}`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          authUserId: data.user!.id,
          email: invite.client.email,
          fullName: invite.client.fullName,
          role: "CLIENT",
        },
      });
      await tx.client.update({
        where: { id: invite.client.id },
        data: { userId: user.id },
      });
      await tx.invite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });
    });
  } catch (e) {
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => null);
    return {
      ok: false,
      error: `No pudimos persistir el usuario: ${(e as Error).message}`,
    };
  }

  return { ok: true };
}
