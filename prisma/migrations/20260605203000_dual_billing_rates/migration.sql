ALTER TABLE "Project"
ADD COLUMN "dedicatedHourlyRate" DECIMAL(10,2),
ADD COLUMN "billDedicated" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Project"
SET
  "dedicatedHourlyRate" = "hourlyRate",
  "billDedicated" = true,
  "hourlyRate" = NULL
WHERE "billingMode" = 'DEDICATED';

ALTER TABLE "Project"
DROP COLUMN "billingMode";

DROP TYPE "ProjectBillingMode";
