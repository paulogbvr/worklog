CREATE TYPE "ClientStatus" AS ENUM (
  'ACTIVE',
  'NO_PROJECT',
  'NEGOTIATING',
  'PAUSED',
  'INACTIVE'
);

ALTER TABLE "Client"
ADD COLUMN "status" "ClientStatus";
