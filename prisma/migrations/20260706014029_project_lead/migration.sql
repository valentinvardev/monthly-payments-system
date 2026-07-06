-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'ARCHIVED', 'CONVERTED');

-- AlterEnum
ALTER TYPE "EmailKind" ADD VALUE 'PROJECT_LEAD';

-- CreateTable
CREATE TABLE "ProjectLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "niche" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "currentUrl" TEXT,
    "problem" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectLead_status_createdAt_idx" ON "ProjectLead"("status", "createdAt");
