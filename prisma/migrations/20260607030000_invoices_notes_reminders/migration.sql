CREATE TYPE "ProjectNoteType" AS ENUM ('FREE', 'CHECKLIST');
CREATE TYPE "ReminderAmountMode" AS ENUM ('PENDING', 'FIXED');
CREATE TYPE "ReminderStatus" AS ENUM ('ACTIVE', 'SENT', 'DISABLED');

ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REMINDER_DUE';

ALTER TABLE "Payment"
ADD COLUMN "invoiceKey" TEXT,
ADD COLUMN "invoicePath" TEXT,
ADD COLUMN "invoiceData" BYTEA,
ADD COLUMN "invoiceName" TEXT,
ADD COLUMN "invoiceMimeType" TEXT,
ADD COLUMN "invoiceSize" INTEGER;

CREATE TABLE "ProjectNote" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "title" TEXT,
  "content" TEXT,
  "type" "ProjectNoteType" NOT NULL DEFAULT 'FREE',
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProjectNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectNoteItem" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectNoteItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentReminder" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "clientId" TEXT,
  "amountMode" "ReminderAmountMode" NOT NULL DEFAULT 'PENDING',
  "fixedAmount" DECIMAL(12,2),
  "dueDate" DATE NOT NULL,
  "message" TEXT,
  "status" "ReminderStatus" NOT NULL DEFAULT 'ACTIVE',
  "sentAt" TIMESTAMP(3),
  "notifiedDueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentReminder_projectId_key" ON "PaymentReminder"("projectId");
CREATE INDEX "ProjectNote_projectId_idx" ON "ProjectNote"("projectId");
CREATE INDEX "ProjectNoteItem_noteId_idx" ON "ProjectNoteItem"("noteId");
CREATE INDEX "PaymentReminder_status_idx" ON "PaymentReminder"("status");
CREATE INDEX "PaymentReminder_dueDate_idx" ON "PaymentReminder"("dueDate");

ALTER TABLE "ProjectNote"
ADD CONSTRAINT "ProjectNote_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectNoteItem"
ADD CONSTRAINT "ProjectNoteItem_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "ProjectNote"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentReminder"
ADD CONSTRAINT "PaymentReminder_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
