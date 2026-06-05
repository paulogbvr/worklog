import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import { parseWorkOperationInput } from "@/server/work-entries/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseWorkOperationInput(body);

    if (!parsed.ok) {
      return NextResponse.json(
        {
          error: parsed.error,
          ok: false
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      select: {
        id: true
      },
      where: {
        active: true,
        id: parsed.data.projectId
      }
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Projeto ativo não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    const operationId = randomUUID();

    await prisma.workLogEntry.createMany({
      data: parsed.data.intervals.map((interval) => ({
        ...interval,
        note: parsed.data.note,
        operationId,
        projectId: parsed.data.projectId
      }))
    });
    revalidatePath("/", "page");

    return NextResponse.json({
      operationId,
      ok: true
    });
  } catch (error) {
    logPrismaError("work entry create", error);

    return NextResponse.json(
      {
        error: "Não foi possível salvar o registro de trabalho.",
        ok: false
      },
      { status: 500 }
    );
  }
}
