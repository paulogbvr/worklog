CREATE TABLE "Profile" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);
