CREATE TYPE "ProjectStatus" AS ENUM (
  'DEVELOPMENT',
  'IN_PROGRESS',
  'WAITING_CLIENT',
  'WAITING_PAYMENT',
  'PAUSED',
  'COMPLETED',
  'CANCELED'
);

ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_STATUS_CHANGED';

ALTER TABLE "Project"
ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'IN_PROGRESS';

ALTER TABLE "Payment"
ADD COLUMN "receiptData" BYTEA,
ADD COLUMN "receiptSize" INTEGER;

CREATE TABLE "ProjectStatusEvent" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "fromStatus" "ProjectStatus",
  "toStatus" "ProjectStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectStatusEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProjectStatusEvent"
ADD CONSTRAINT "ProjectStatusEvent_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ProjectStatusEvent_projectId_idx" ON "ProjectStatusEvent"("projectId");
CREATE INDEX "ProjectStatusEvent_createdAt_idx" ON "ProjectStatusEvent"("createdAt");
