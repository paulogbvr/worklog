import { Prisma } from "@prisma/client";

export function getPrismaErrorCode(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }

  return error instanceof Error ? error.name : "unknown";
}

export function logPrismaError(scope: string, error: unknown) {
  console.error(`[${scope}] failed (${getPrismaErrorCode(error)})`);
}
