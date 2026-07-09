import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { generateIcon } from "@/server/icon-gen";
import {
  deleteGeneratedIcon,
  uploadGeneratedIcon,
} from "@/lib/supabase/icon-storage";

export const iconsRouter = createTRPCRouter({
  generate: adminProcedure
    .input(
      z.object({
        prompt: z.string().min(4).max(1500),
        label: z.string().min(1).max(60).default("icono"),
        count: z.number().int().min(1).max(4).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const saved: { id: string; url: string; label: string }[] = [];
      const errors: string[] = [];
      // Secuencial a propósito: no golpeamos rate limits de Gemini.
      for (let i = 0; i < input.count; i++) {
        try {
          const png = await generateIcon(input.prompt);
          const { path, url } = await uploadGeneratedIcon({ label: input.label, png });
          const row = await ctx.prisma.generatedIcon.create({
            data: { label: input.label, prompt: input.prompt, path, url },
          });
          saved.push({ id: row.id, url: row.url, label: row.label });
        } catch (e) {
          errors.push((e as Error).message);
        }
        if (i < input.count - 1) await new Promise((r) => setTimeout(r, 1200));
      }
      if (saved.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errors[0] ?? "No se pudo generar ninguna imagen",
        });
      }
      return { saved, errors };
    }),

  list: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.generatedIcon.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const icon = await ctx.prisma.generatedIcon.findUnique({ where: { id: input.id } });
      if (!icon) throw new TRPCError({ code: "NOT_FOUND" });
      await deleteGeneratedIcon(icon.path);
      await ctx.prisma.generatedIcon.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
