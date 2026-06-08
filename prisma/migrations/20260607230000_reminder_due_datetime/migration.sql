ALTER TABLE "PaymentReminder"
ALTER COLUMN "dueDate" TYPE TIMESTAMP(3) USING "dueDate"::timestamp;
