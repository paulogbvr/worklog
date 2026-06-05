import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import { parseWorkEntryInput } from "@/server/work-entries/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseWorkEntryInput(body);

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

    await prisma.workLogEntry.update({
      data: parsed.data,
      where: {
        id
      }
    });
    revalidatePath("/", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("work entry update", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Registro de trabalho não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

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

    await prisma.workLogEntry.delete({
      where: {
        id
      }
    });
    revalidatePath("/", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("work entry delete", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Registro de trabalho não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível remover o registro de trabalho.",
        ok: false
      },
      { status: 500 }
    );
  }
}
