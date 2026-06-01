import { revalidatePath } from "next/cache";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/lib/env";

export const mercadoPagoRouter = createTRPCRouter({
  getConnection: adminProcedure.query(async ({ ctx }) => {
    const conn = await ctx.prisma.mercadoPagoConnection.findUnique({
      where: { userId: ctx.user.id },
      select: {
        id: true,
        mpUserId: true,
        mpEmail: true,
        mpNickname: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const configured = Boolean(env.MERCADOPAGO_CLIENT_ID && env.MERCADOPAGO_CLIENT_SECRET);
    return { connection: conn, configured };
  }),

  disconnect: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.mercadoPagoConnection.deleteMany({
      where: { userId: ctx.user.id },
    });
    revalidatePath("/dashboard/payment-methods");
    return { ok: true };
  }),
});
