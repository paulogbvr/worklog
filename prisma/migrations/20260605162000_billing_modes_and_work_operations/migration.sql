CREATE TYPE "ProjectBillingMode" AS ENUM ('WAKATIME', 'DEDICATED');

ALTER TABLE "Project"
ADD COLUMN "billingMode" "ProjectBillingMode" NOT NULL DEFAULT 'WAKATIME';

ALTER TABLE "WorkLogEntry"
ADD COLUMN "operationId" TEXT;

UPDATE "WorkLogEntry"
SET "operationId" = "id"
WHERE "operationId" IS NULL;

ALTER TABLE "WorkLogEntry"
ALTER COLUMN "operationId" SET NOT NULL;

CREATE INDEX "WorkLogEntry_operationId_idx" ON "WorkLogEntry"("operationId");
