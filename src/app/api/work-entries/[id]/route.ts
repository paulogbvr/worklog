import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import { parseWorkOperationInput } from "@/server/work-entries/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    const existingOperation = await prisma.workLogEntry.findFirst({
      select: {
        operationId: true
      },
      where: {
        operationId: id
      }
    });

    if (!existingOperation) {
      return NextResponse.json(
        {
          error: "Operação de trabalho não encontrada.",
          ok: false
        },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.workLogEntry.deleteMany({
        where: {
          operationId: id
        }
      }),
      prisma.workLogEntry.createMany({
        data: parsed.data.intervals.map((interval) => ({
          ...interval,
          note: parsed.data.note,
          operationId: id,
          projectId: parsed.data.projectId
        }))
      })
    ]);
    revalidatePath("/", "page");
    revalidatePath("/operations", "page");
    revalidatePath("/records", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("work entry update", error);

    return NextResponse.json(
      {
        error: "Não foi possível atualizar o registro de trabalho.",
        ok: false
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await prisma.workLogEntry.deleteMany({
      where: {
        operationId: id
      }
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error: "Operação de trabalho não encontrada.",
          ok: false
        },
        { status: 404 }
      );
    }

    revalidatePath("/", "page");
    revalidatePath("/operations", "page");
    revalidatePath("/records", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("work entry delete", error);

    return NextResponse.json(
      {
        error: "Não foi possível remover o registro de trabalho.",
        ok: false
      },
      { status: 500 }
    );
  }
}
