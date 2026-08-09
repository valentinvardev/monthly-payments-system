-- CreateEnum
CREATE TYPE "ProspectTri" AS ENUM ('SI', 'NO', 'NO_SE');

-- CreateEnum
CREATE TYPE "ProspectStage" AS ENUM ('SIN_CONTACTAR', 'CONTACTADO', 'RESPONDIO', 'LLAMADA_AGENDADA', 'PROPUESTA_ENVIADA', 'GANADO', 'PERDIDO', 'DESCARTADO');

-- CreateEnum
CREATE TYPE "ProspectChannel" AS ENUM ('EMAIL', 'INSTAGRAM_DM', 'TELEFONO', 'PRESENCIAL', 'REFERIDO');

-- CreateEnum
CREATE TYPE "ProspectActivityKind" AS ENUM ('NOTA', 'CONTACTO', 'RESPUESTA', 'LLAMADA', 'PROPUESTA', 'CAMBIO_ESTADO');

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'idiomas',
    "email" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "usesMercadoPago" "ProspectTri" NOT NULL DEFAULT 'NO_SE',
    "over100Students" "ProspectTri" NOT NULL DEFAULT 'NO_SE',
    "chargesMonthly" "ProspectTri" NOT NULL DEFAULT 'NO_SE',
    "frictionNote" TEXT,
    "stage" "ProspectStage" NOT NULL DEFAULT 'SIN_CONTACTAR',
    "contactedAt" TIMESTAMP(3),
    "channel" "ProspectChannel",
    "followUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectActivity" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "kind" "ProspectActivityKind" NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProspectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prospect_stage_priority_idx" ON "Prospect"("stage", "priority");

-- CreateIndex
CREATE INDEX "Prospect_priority_createdAt_idx" ON "Prospect"("priority", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_name_zone_key" ON "Prospect"("name", "zone");

-- CreateIndex
CREATE INDEX "ProspectActivity_prospectId_createdAt_idx" ON "ProspectActivity"("prospectId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProspectActivity" ADD CONSTRAINT "ProspectActivity_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row Level Security, igual que el resto de las tablas públicas.
-- Prisma entra con el rol `postgres` y la saltea; habilitarla sin
-- políticas bloquea cualquier consulta que llegue con la anon key.
-- Va acá y no en enable-rls.sql para que no exista una ventana en la
-- que las tablas estén creadas pero desprotegidas.
ALTER TABLE public."Prospect"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProspectActivity" ENABLE ROW LEVEL SECURITY;
