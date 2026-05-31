import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { healthRouter } from "@/server/api/routers/health";
import { exchangeRateRouter } from "@/server/api/routers/exchangeRate";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  exchangeRate: exchangeRateRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
