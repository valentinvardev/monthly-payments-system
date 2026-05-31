import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type {
  BankAccountDetails,
  CryptoWalletDetails,
  PaymentMethodConfigDto,
} from "@/lib/types";

export const paymentMethodsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }): Promise<PaymentMethodConfigDto[]> => {
    const rows = await ctx.prisma.paymentMethodConfig.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => {
      if (r.kind === "BANK_ACCOUNT") {
        return {
          id: r.id,
          kind: "BANK_ACCOUNT",
          label: r.label,
          details: r.details as unknown as BankAccountDetails,
          instructions: r.instructions,
          active: r.active,
          sortOrder: r.sortOrder,
        };
      }
      return {
        id: r.id,
        kind: "CRYPTO_WALLET",
        label: r.label,
        details: r.details as unknown as CryptoWalletDetails,
        instructions: r.instructions,
        active: r.active,
        sortOrder: r.sortOrder,
      };
    });
  }),
});
