import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { generateIcon } from "@/server/icon-gen";

export const iconsRouter = createTRPCRouter({
  generate: adminProcedure
    .input(
      z.object({
        prompt: z.string().min(4).max(1500),
        count: z.number().int().min(1).max(4).default(1),
      }),
    )
    .mutation(async ({ input }) => {
      const images: string[] = [];
      const errors: string[] = [];
      // Secuencial a propósito: no golpeamos rate limits de Gemini.
      for (let i = 0; i < input.count; i++) {
        try {
          images.push(await generateIcon(input.prompt));
        } catch (e) {
          errors.push((e as Error).message);
        }
        if (i < input.count - 1) await new Promise((r) => setTimeout(r, 1200));
      }
      if (images.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errors[0] ?? "No se pudo generar ninguna imagen",
        });
      }
      return { images, errors };
    }),
});
