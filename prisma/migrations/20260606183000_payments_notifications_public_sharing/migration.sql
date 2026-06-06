CREATE TYPE "NotificationCategory" AS ENUM ('IMPORTANT', 'UPDATE');
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'TED', 'CASH', 'BOLETO', 'OTHER');
CREATE TYPE "ShareEventType" AS ENUM ('ACCESS', 'COPY_LINK', 'PDF_DOWNLOAD');

ALTER TYPE "NotificationType" ADD VALUE 'SHARE_COPIED';
ALTER TYPE "NotificationType" ADD VALUE 'SHARE_PDF_DOWNLOADED';
ALTER TYPE "NotificationType" ADD VALUE 'ENV_WARNING';

ALTER TABLE "Payment"
ADD COLUMN "method" "PaymentMethod" NOT NULL DEFAULT 'OTHER',
ADD COLUMN "receiptPath" TEXT,
ADD COLUMN "receiptName" TEXT,
ADD COLUMN "receiptMimeType" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Notification"
ADD COLUMN "category" "NotificationCategory" NOT NULL DEFAULT 'IMPORTANT',
ADD COLUMN "shareLinkId" TEXT;

UPDATE "Notification"
SET "category" = 'UPDATE'
WHERE "type" = 'SYNC_SUCCESS';

CREATE TABLE "ShareEvent" (
  "id" TEXT NOT NULL,
  "shareLinkId" TEXT NOT NULL,
  "type" "ShareEventType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_shareLinkId_fkey"
FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShareEvent"
ADD CONSTRAINT "ShareEvent_shareLinkId_fkey"
FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Notification_shareLinkId_idx" ON "Notification"("shareLinkId");
CREATE INDEX "Notification_category_readAt_idx" ON "Notification"("category", "readAt");
CREATE INDEX "ShareEvent_shareLinkId_idx" ON "ShareEvent"("shareLinkId");
CREATE INDEX "ShareEvent_type_idx" ON "ShareEvent"("type");
CREATE INDEX "ShareEvent_createdAt_idx" ON "ShareEvent"("createdAt");
