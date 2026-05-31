import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { store } from "@/lib/demo/store";

export const paymentMethodsRouter = createTRPCRouter({
  list: publicProcedure.query(() =>
    store()
      .paymentMethods.filter((m) => m.active)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  ),
});
