ALTER TABLE "Client"
ADD COLUMN "taxId" TEXT,
ADD COLUMN "birthDate" DATE,
ADD COLUMN "address" TEXT;

CREATE UNIQUE INDEX "Client_taxId_key" ON "Client"("taxId");
