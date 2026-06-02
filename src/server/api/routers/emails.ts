import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { EMAIL_CATALOG, getEntry, type EmailTestKey } from "@/lib/email-catalog";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { env } from "@/lib/env";

export const emailsRouter = createTRPCRouter({
  list: adminProcedure.query(() => {
    return EMAIL_CATALOG.map((e) => ({
      key: e.key,
      label: e.label,
      description: e.description,
      audience: e.audience,
      trigger: e.trigger,
    }));
  }),

  sendTest: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      if (!isEmailConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Resend no está configurado. Cargá RESEND_API_KEY (y RESEND_FROM_EMAIL) en el .env del server.",
        });
      }
      const entry = getEntry(input.key);
      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template desconocido" });
      }

      const built = entry.build(env.APP_URL.replace(/\/+$/, ""));
      const res = await sendEmail({
        kind: entry.logKind,
        to: env.ADMIN_EMAIL,
        subject: built.subject,
        template: built.template,
      });
      if (!res.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            res.reason === "not_configured"
              ? "Resend no está configurado en este server."
              : `Resend rechazó el envío: ${
                  "error" in res ? String((res.error as { message?: string })?.message ?? res.error) : "desconocido"
                }`,
        });
      }
      return { sentTo: env.ADMIN_EMAIL, providerId: res.id };
    }),
});

export type EmailsRouter = typeof emailsRouter;
export type { EmailTestKey };
