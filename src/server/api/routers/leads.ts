import { z } from "zod";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { ProjectLeadEmail } from "@/emails/ProjectLeadEmail";
import { ProjectLeadConfirmEmail } from "@/emails/ProjectLeadConfirmEmail";
import {
  BUDGET_OPTIONS,
  CURRENT_STATE_OPTIONS,
  NICHE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  URGENCY_OPTIONS,
  optionLabel,
  values,
} from "@/lib/studio/intake";

export const leadsRouter = createTRPCRouter({
  // Público: el formulario /contanos. El campo `website` es un honeypot —
  // los humanos no lo ven; si viene con contenido, descartamos en silencio.
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(120),
        email: z.string().email().max(200),
        company: z.string().max(120).optional(),
        niche: z.enum(values(NICHE_OPTIONS)),
        projectType: z.enum(values(PROJECT_TYPE_OPTIONS)),
        currentState: z.enum(values(CURRENT_STATE_OPTIONS)),
        currentUrl: z.string().max(300).optional(),
        problem: z.string().min(20).max(4000),
        budgetRange: z.enum(values(BUDGET_OPTIONS)),
        urgency: z.enum(values(URGENCY_OPTIONS)),
        locale: z.enum(["es", "en", "pt"]).default("es"),
        website: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { website, ...data } = input;
      // Honeypot con contenido → bot. Fingimos éxito sin guardar nada.
      if (website) return { ok: true };

      const lead = await ctx.prisma.projectLead.create({
        data: {
          ...data,
          company: data.company?.trim() || null,
          currentUrl: data.currentUrl?.trim() || null,
        },
      });

      const appUrl = env.APP_URL.replace(/\/+$/, "");
      // Los emails salen después de responder (after): el visitante no
      // espera dos round-trips a Resend. Cada envío loguea su resultado
      // en EmailLog; si Resend falla, el lead igual quedó guardado.
      after(async () => {
        await sendEmail({
          kind: "PROJECT_LEAD",
          to: env.ADMIN_EMAIL,
          subject: `Nuevo lead: ${lead.name} — ${optionLabel(NICHE_OPTIONS, lead.niche, "es")}`,
          template: ProjectLeadEmail({
            name: lead.name,
            email: lead.email,
            company: lead.company,
            adminUrl: `${appUrl}/dashboard/leads`,
            answers: [
              { label: "Nicho", value: optionLabel(NICHE_OPTIONS, lead.niche, "es") },
              { label: "Proyecto", value: optionLabel(PROJECT_TYPE_OPTIONS, lead.projectType, "es") },
              { label: "Hoy tiene", value: optionLabel(CURRENT_STATE_OPTIONS, lead.currentState, "es") },
              ...(lead.currentUrl ? [{ label: "URL actual", value: lead.currentUrl }] : []),
              { label: "Problema", value: lead.problem },
              { label: "Presupuesto", value: optionLabel(BUDGET_OPTIONS, lead.budgetRange, "es") },
              { label: "Urgencia", value: optionLabel(URGENCY_OPTIONS, lead.urgency, "es") },
              { label: "Idioma", value: lead.locale.toUpperCase() },
            ],
          }),
        });
        await sendEmail({
          kind: "PROJECT_LEAD",
          to: lead.email,
          subject:
            lead.locale === "en"
              ? "We got your message — Surcodia Studio"
              : lead.locale === "pt"
                ? "Recebemos sua mensagem — Surcodia Studio"
                : "Recibimos tu consulta — Surcodia Studio",
          template: ProjectLeadConfirmEmail({
            name: lead.name,
            locale: lead.locale as "es" | "en" | "pt",
          }),
        });
      });

      revalidatePath("/dashboard/leads");
      return { ok: true };
    }),

  list: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.projectLead.findMany({ orderBy: { createdAt: "desc" } });
  }),

  setStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["NEW", "CONTACTED", "ARCHIVED", "CONVERTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.prisma.projectLead.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      revalidatePath("/dashboard/leads");
      return lead;
    }),
});
