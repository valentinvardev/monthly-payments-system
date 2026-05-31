import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getUserFromCookieHeader } from "@/lib/auth";

export async function createTRPCContext(opts: { headers: Headers }) {
  const user = getUserFromCookieHeader(opts.headers.get("cookie"));
  return { headers: opts.headers, user };
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
  if (ctx.user.role !== "CLIENT" || !ctx.user.clientId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { ...ctx, user: ctx.user, clientId: ctx.user.clientId } });
});
