import { NextResponse } from "next/server";
import { ShareEventType } from "@prisma/client";
import { getPublicProject, recordShareEvent } from "@/server/sharing";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as { type?: string };

    if (body.type !== ShareEventType.COPY_LINK) {
      return NextResponse.json(
        {
          error: "Evento de compartilhamento inválido.",
          ok: false
        },
        { status: 400 }
      );
    }

    const project = await getPublicProject(slug);

    if (!project) {
      return NextResponse.json(
        {
          error: "Link compartilhável não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    await recordShareEvent(
      {
        projectId: project.projectId,
        projectName: project.name,
        shareLinkId: project.id
      },
      ShareEventType.COPY_LINK
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível registrar o evento.",
        ok: false
      },
      { status: 500 }
    );
  }
}
