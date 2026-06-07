CREATE TYPE "BillingMode" AS ENUM ('HOURLY', 'FIXED');

ALTER TABLE "Project"
ADD COLUMN "billingMode" "BillingMode" NOT NULL DEFAULT 'HOURLY',
ADD COLUMN "fixedPrice" DECIMAL(12, 2);
