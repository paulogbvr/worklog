import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, ProjectNoteType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import {
  serializeProjectNote,
  type ProjectNoteItemInput
} from "@/server/project-notes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseType(value: unknown) {
  return value === ProjectNoteType.CHECKLIST
    ? ProjectNoteType.CHECKLIST
    : ProjectNoteType.FREE;
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const notes = await prisma.projectNote.findMany({
      include: {
        items: {
          orderBy: {
            position: "asc"
          }
        }
      },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      where: {
        projectId: id
      }
    });

    return NextResponse.json({
      notes: notes.map(serializeProjectNote),
      ok: true
    });
  } catch (error) {
    logPrismaError("project notes list", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar as notas do projeto.",
        ok: false
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const type = parseType(body.type);
    const title = optionalText(body.title);
    const content = optionalText(body.content);
    const items = type === ProjectNoteType.CHECKLIST ? parseItems(body.items) : [];

    if (!title && !content && items.length === 0) {
      return NextResponse.json(
        {
          error: "Adicione um título, conteúdo ou pelo menos um item.",
          ok: false
        },
        { status: 400 }
      );
    }

    const count = await prisma.projectNote.count({ where: { projectId: id } });
    const note = await prisma.projectNote.create({
      data: {
        content,
        items: {
          create: items
        },
        position: count,
        projectId: id,
        title,
        type
      },
      include: {
        items: {
          orderBy: {
            position: "asc"
          }
        }
      }
    });

    revalidatePath("/projects", "page");

    return NextResponse.json({ note: serializeProjectNote(note), ok: true });
  } catch (error) {
    logPrismaError("project note create", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Projeto não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível salvar a nota do projeto.",
        ok: false
      },
      { status: 500 }
    );
  }
}

// Reorders the project's notes from an ordered list of note ids.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { order?: unknown };
    const order = Array.isArray(body.order)
      ? body.order.filter((value): value is string => typeof value === "string")
      : [];

    if (order.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhuma ordem informada.",
          ok: false
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      order.map((noteId, index) =>
        prisma.projectNote.updateMany({
          data: { position: index },
          where: { id: noteId, projectId: id }
        })
      )
    );

    revalidatePath("/projects", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("project notes reorder", error);

    return NextResponse.json(
      {
        error: "Não foi possível reordenar as notas.",
        ok: false
      },
      { status: 500 }
    );
  }
}
