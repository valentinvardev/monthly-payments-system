import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { healthRouter } from "@/server/api/routers/health";
import { exchangeRateRouter } from "@/server/api/routers/exchangeRate";
import { clientsRouter } from "@/server/api/routers/clients";
import { invoicesRouter } from "@/server/api/routers/invoices";
import { paymentsRouter } from "@/server/api/routers/payments";
import { paymentMethodsRouter } from "@/server/api/routers/paymentMethods";
import { mercadoPagoRouter } from "@/server/api/routers/mercadoPago";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  exchangeRate: exchangeRateRouter,
  clients: clientsRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  paymentMethods: paymentMethodsRouter,
  mercadoPago: mercadoPagoRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
