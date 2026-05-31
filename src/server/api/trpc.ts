import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createTRPCContext(opts: { headers: Headers }) {
  const user = await getCurrentUser();
  return { headers: opts.headers, user, prisma };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const clientProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "CLIENT") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  const client = await ctx.prisma.client.findUnique({
    where: { userId: ctx.user.id },
  });
  if (!client) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tu usuario no está vinculado a un cliente",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user, clientId: client.id } });
});
