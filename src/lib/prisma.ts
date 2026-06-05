import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getRuntimeDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const isSupabaseTransactionPooler =
      url.hostname.endsWith(".pooler.supabase.com") && url.port === "6543";

    if (isSupabaseTransactionPooler) {
      url.searchParams.set("pgbouncer", "true");

      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }

      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "20");
      }
    }

    return url.toString();
  } catch {
    return value;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getRuntimeDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
