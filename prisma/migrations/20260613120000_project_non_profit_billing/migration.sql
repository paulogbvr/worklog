-- Add a free / non-profit billing mode. Existing projects keep HOURLY or FIXED.
ALTER TYPE "BillingMode" ADD VALUE IF NOT EXISTS 'NON_PROFIT';
