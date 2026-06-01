import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import type {
  BankAccountDetails,
  CryptoWalletDetails,
  PaymentMethodConfigDto,
} from "@/lib/types";

const bankDetails = z.object({
  bankName: z.string().min(1),
  accountHolder: z.string().min(1),
  cbu: z.string().min(1),
  alias: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
});

const cryptoDetails = z.object({
  network: z.string().min(1),
  asset: z.string().min(1),
  address: z.string().min(1),
  memo: z.string().optional().nullable(),
});

const baseInput = z.object({
  label: z.string().min(1),
  instructions: z.string().optional().nullable(),
  sortOrder: z.number().int().nonnegative().default(0),
});

const createBank = baseInput.extend({
  kind: z.literal("BANK_ACCOUNT"),
  details: bankDetails,
});

const createCrypto = baseInput.extend({
  kind: z.literal("CRYPTO_WALLET"),
  details: cryptoDetails,
});

function rowToDto(r: {
  id: string;
  kind: "BANK_ACCOUNT" | "CRYPTO_WALLET";
  label: string;
  details: unknown;
  instructions: string | null;
  active: boolean;
  sortOrder: number;
}): PaymentMethodConfigDto {
  if (r.kind === "BANK_ACCOUNT") {
    return {
      id: r.id,
      kind: "BANK_ACCOUNT",
      label: r.label,
      details: r.details as BankAccountDetails,
      instructions: r.instructions,
      active: r.active,
      sortOrder: r.sortOrder,
    };
  }
  return {
    id: r.id,
    kind: "CRYPTO_WALLET",
    label: r.label,
    details: r.details as CryptoWalletDetails,
    instructions: r.instructions,
    active: r.active,
    sortOrder: r.sortOrder,
  };
}

export const paymentMethodsRouter = createTRPCRouter({
  // Public — feeds the client portal pay flow (only active methods)
  list: publicProcedure.query(async ({ ctx }): Promise<PaymentMethodConfigDto[]> => {
    const rows = await ctx.prisma.paymentMethodConfig.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(rowToDto);
  }),

  // Admin — includes disabled methods, used by the management page
  listAll: adminProcedure.query(async ({ ctx }): Promise<PaymentMethodConfigDto[]> => {
    const rows = await ctx.prisma.paymentMethodConfig.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(rowToDto);
  }),

  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.paymentMethodConfig.findUnique({
        where: { id: input.id },
      });
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return rowToDto(row);
    }),

  create: adminProcedure
    .input(z.discriminatedUnion("kind", [createBank, createCrypto]))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.paymentMethodConfig.create({
        data: {
          kind: input.kind,
          label: input.label,
          details: input.details,
          instructions: input.instructions ?? null,
          sortOrder: input.sortOrder,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.discriminatedUnion("kind", [
        createBank.extend({ id: z.string() }),
        createCrypto.extend({ id: z.string() }),
      ]),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.paymentMethodConfig.update({
        where: { id: input.id },
        data: {
          kind: input.kind,
          label: input.label,
          details: input.details,
          instructions: input.instructions ?? null,
          sortOrder: input.sortOrder,
        },
      });
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.paymentMethodConfig.update({
        where: { id: input.id },
        data: { active: input.active },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.paymentMethodConfig.delete({ where: { id: input.id } });
    }),
});
