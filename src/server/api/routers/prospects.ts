import { z } from "zod";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  CONTACTED_STAGES,
  REPLIED_STAGES,
  STAGE_ORDER,
  followUpDate,
  qualifies,
  responseRateAlarm,
  type Stage,
} from "@/lib/studio/prospects";

// El cast a tupla conserva los literales: con [string, ...string[]] zod
// infiere `string` y Prisma rechaza el where por no ser el enum.
const stageEnum = z.enum(STAGE_ORDER as [Stage, ...Stage[]]);
const triEnum = z.enum(["SI", "NO", "NO_SE"]);
const channelEnum = z.enum([
  "EMAIL",
  "INSTAGRAM_DM",
  "TELEFONO",
  "PRESENCIAL",
  "REFERIDO",
]);

const PATH = "/dashboard/prospectos";

export const prospectsRouter = createTRPCRouter({
  // Lista para trabajar. El orden por defecto es el orden de trabajo de la
  // planilla: primero prioridad 1, y dentro de esos los que califican.
  // Como «califica» es derivado no se puede ordenar por él en SQL, así que
  // se ordena en memoria — con centenares de filas es irrelevante y evita
  // desnormalizar un campo que puede quedar desincronizado.
  list: adminProcedure
    .input(
      z
        .object({
          stage: stageEnum.optional(),
          priority: z.union([z.literal(1), z.literal(2)]).optional(),
          segment: z.string().max(40).optional(),
          onlyQualified: z.boolean().default(false),
          search: z.string().max(120).optional(),
        })
        .default({ onlyQualified: false }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.prospect.findMany({
        where: {
          ...(input.stage && { stage: input.stage }),
          ...(input.priority && { priority: input.priority }),
          ...(input.segment && { segment: input.segment }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" as const } },
              { zone: { contains: input.search, mode: "insensitive" as const } },
            ],
          }),
        },
        include: {
          activities: { orderBy: { createdAt: "desc" }, take: 5 },
        },
        take: 500,
      });

      // `qualifies` y `followUpDue` se derivan acá, en el servidor: leer el
      // reloj durante el render de un componente es impuro y da resultados
      // que cambian solos entre renders.
      const now = Date.now();
      const withFlag = rows.map((p) => ({
        ...p,
        qualifies: qualifies(p),
        followUpDue: p.followUpAt != null && p.followUpAt.getTime() <= now,
      }));
      const filtered = input.onlyQualified ? withFlag.filter((p) => p.qualifies) : withFlag;

      return filtered.sort(
        (a, b) =>
          a.priority - b.priority ||
          Number(b.qualifies) - Number(a.qualifies) ||
          a.name.localeCompare(b.name, "es"),
      );
    }),

  // El panel de la planilla, calculado en la base.
  stats: adminProcedure.query(async ({ ctx }) => {
    const [byStage, total, priority1, withEmail, all] = await Promise.all([
      ctx.prisma.prospect.groupBy({ by: ["stage"], _count: { _all: true } }),
      ctx.prisma.prospect.count(),
      ctx.prisma.prospect.count({ where: { priority: 1 } }),
      ctx.prisma.prospect.count({ where: { NOT: { email: null } } }),
      ctx.prisma.prospect.findMany({
        select: { usesMercadoPago: true, over100Students: true, chargesMonthly: true },
      }),
    ]);

    const stageCount = Object.fromEntries(
      STAGE_ORDER.map((s) => [s, byStage.find((g) => g.stage === s)?._count._all ?? 0]),
    ) as Record<string, number>;

    const sum = (stages: readonly string[]) =>
      stages.reduce((acc, s) => acc + (stageCount[s] ?? 0), 0);

    const contacted = sum(CONTACTED_STAGES);
    const replied = sum(REPLIED_STAGES);

    return {
      total,
      priority1,
      withEmail,
      qualified: all.filter(qualifies).length,
      stageCount,
      contacted,
      replied,
      ...responseRateAlarm(contacted, replied),
    };
  }),

  // Las tres preguntas del filtro. Se guardan de a una para que calificar
  // sea un clic y no un formulario.
  qualify: adminProcedure
    .input(
      z.object({
        id: z.string(),
        field: z.enum(["usesMercadoPago", "over100Students", "chargesMonthly"]),
        value: triEnum,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.prospect.update({
        where: { id: input.id },
        data: { [input.field]: input.value },
      });
      revalidatePath(PATH);
      return { ...updated, qualifies: qualifies(updated) };
    }),

  setFrictionNote: adminProcedure
    .input(z.object({ id: z.string(), note: z.string().max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const note = input.note.trim();
      const updated = await ctx.prisma.prospect.update({
        where: { id: input.id },
        data: { frictionNote: note === "" ? null : note },
      });
      revalidatePath(PATH);
      return updated;
    }),

  // Cambiar de etapa deja rastro en la bitácora: sin eso no hay forma de
  // reconstruir cómo se trabajó un prospecto ni de auditar la tasa.
  setStage: adminProcedure
    .input(
      z.object({
        id: z.string(),
        stage: stageEnum,
        channel: channelEnum.optional(),
        note: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const before = await ctx.prisma.prospect.findUnique({ where: { id: input.id } });
      if (!before) throw new TRPCError({ code: "NOT_FOUND" });

      // Al pasar a contactado se sella la fecha y se agenda el único
      // seguimiento. Si ya estaba contactado no se pisa la fecha original,
      // porque es la que sostiene la tasa de respuesta.
      const enteringContacted =
        input.stage === "CONTACTADO" && before.stage === "SIN_CONTACTAR";

      const updated = await ctx.prisma.prospect.update({
        where: { id: input.id },
        data: {
          stage: input.stage,
          ...(input.channel && { channel: input.channel }),
          ...(enteringContacted && {
            contactedAt: before.contactedAt ?? new Date(),
            followUpAt: followUpDate(),
          }),
          // Una vez que respondió, el recordatorio de seguimiento sobra.
          ...(REPLIED_STAGES.includes(input.stage as never) && { followUpAt: null }),
        },
      });

      await ctx.prisma.prospectActivity.create({
        data: {
          prospectId: input.id,
          kind: input.stage === "CONTACTADO" ? "CONTACTO" : "CAMBIO_ESTADO",
          body: input.note?.trim() || null,
        },
      });

      revalidatePath(PATH);
      return updated;
    }),

  addActivity: adminProcedure
    .input(
      z.object({
        id: z.string(),
        kind: z.enum(["NOTA", "CONTACTO", "RESPUESTA", "LLAMADA", "PROPUESTA"]),
        body: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const activity = await ctx.prisma.prospectActivity.create({
        data: { prospectId: input.id, kind: input.kind, body: input.body.trim() },
      });
      revalidatePath(PATH);
      return activity;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(160),
        zone: z.string().min(1).max(80),
        segment: z.string().max(40).default("idiomas"),
        email: z.string().email().max(200).optional().or(z.literal("")),
        instagram: z.string().max(120).optional(),
        website: z.string().max(300).optional(),
        phone: z.string().max(40).optional(),
        priority: z.union([z.literal(1), z.literal(2)]).default(2),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.prospect.findUnique({
        where: { name_zone: { name: input.name, zone: input.zone } },
        select: { id: true },
      });
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Ya existe «${input.name}» en ${input.zone}`,
        });
      }
      const created = await ctx.prisma.prospect.create({
        data: { ...input, email: input.email || null },
      });
      revalidatePath(PATH);
      return created;
    }),
});
