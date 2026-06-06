CREATE TYPE "NotificationType" AS ENUM (
  'SHARE_ACCESSED',
  'SHARE_CREATED',
  'SYNC_SUCCESS',
  'SYNC_ERROR'
);

ALTER TABLE "Project"
ADD COLUMN "repositoryUrl" TEXT;

ALTER TABLE "ShareLink"
ADD COLUMN "accessCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastAccessedAt" TIMESTAMP(3);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "projectId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");
CREATE INDEX "Notification_projectId_idx" ON "Notification"("projectId");

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
