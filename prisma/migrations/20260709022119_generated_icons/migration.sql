-- CreateTable
CREATE TABLE "GeneratedIcon" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedIcon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedIcon_createdAt_idx" ON "GeneratedIcon"("createdAt");
