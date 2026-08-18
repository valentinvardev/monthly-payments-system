-- CreateTable
CREATE TABLE "QuoteAttachment" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteAttachment_quoteId_sortOrder_idx" ON "QuoteAttachment"("quoteId", "sortOrder");

-- AddForeignKey
ALTER TABLE "QuoteAttachment" ADD CONSTRAINT "QuoteAttachment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row Level Security, igual que el resto de las tablas públicas.
-- Prisma entra con el rol `postgres` y la saltea; habilitarla sin
-- políticas bloquea cualquier consulta que llegue con la anon key.
-- Va acá y no en enable-rls.sql para que no exista una ventana en la
-- que la tabla esté creada pero desprotegida.
ALTER TABLE public."QuoteAttachment" ENABLE ROW LEVEL SECURITY;
