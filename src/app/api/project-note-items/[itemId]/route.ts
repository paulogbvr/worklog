import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";

export const runtime = "nodejs";

// Idempotent single-item toggle. Updating one ProjectNoteItem by id (instead of
// deleting and recreating the whole checklist) keeps ids stable and prevents the
// duplication/loss that concurrent rapid toggles caused.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await context.params;
    const body = (await request.json()) as { completed?: unknown };
    const completed = Boolean(body.completed);

    await prisma.projectNoteItem.update({
      data: { completed },
      where: { id: itemId }
    });

    revalidatePath("/projects", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("project note item toggle", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Item não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível atualizar o item.",
        ok: false
      },
      { status: 500 }
    );
  }
}
