import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getUsdToArsRate } from "@/lib/exchange-rate";

export const exchangeRateRouter = createTRPCRouter({
  usdToArs: publicProcedure.query(async () => {
    const rate = await getUsdToArsRate();
    return {
      pair: rate.pair,
      source: rate.source,
      rate: rate.rate,
      fetchedAt: rate.fetchedAt,
      cached: rate.cached,
    };
  }),
});
