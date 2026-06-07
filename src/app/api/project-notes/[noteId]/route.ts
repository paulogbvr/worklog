import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, ProjectNoteType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import {
  serializeProjectNote,
  type ProjectNoteItemInput
} from "@/server/project-notes";

export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseItems(value: unknown): ProjectNoteItemInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      const text =
        typeof item === "object" && item && "text" in item
          ? optionalText((item as Record<string, unknown>).text)
          : null;

      if (!text) {
        return null;
      }

      const completed =
        typeof item === "object" && item && "completed" in item
          ? Boolean((item as Record<string, unknown>).completed)
          : false;

      return { completed, position: index, text };
    })
    .filter((item): item is ProjectNoteItemInput => item !== null);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const type =
      body.type === ProjectNoteType.CHECKLIST
        ? ProjectNoteType.CHECKLIST
        : body.type === ProjectNoteType.FREE
          ? ProjectNoteType.FREE
          : null;
    const title = optionalText(body.title);
    const content = optionalText(body.content);
    const items = Array.isArray(body.items) ? parseItems(body.items) : null;

    const note = await prisma.$transaction(async (tx) => {
      if (items !== null) {
        await tx.projectNoteItem.deleteMany({ where: { noteId } });
      }

      return tx.projectNote.update({
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(content !== undefined ? { content } : {}),
          ...(type ? { type } : {}),
          ...(items !== null
            ? {
                items: {
                  create: items
                }
              }
            : {})
        },
        include: {
          items: {
            orderBy: {
              position: "asc"
            }
          }
        },
        where: {
          id: noteId
        }
      });
    });

    revalidatePath("/projects", "page");

    return NextResponse.json({ note: serializeProjectNote(note), ok: true });
  } catch (error) {
    logPrismaError("project note update", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Nota não encontrada.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível atualizar a nota.",
        ok: false
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await context.params;
    await prisma.projectNote.delete({ where: { id: noteId } });
    revalidatePath("/projects", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("project note delete", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Nota não encontrada.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível remover a nota.",
        ok: false
      },
      { status: 500 }
    );
  }
}
