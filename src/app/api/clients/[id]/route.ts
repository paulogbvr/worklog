import { NextResponse } from "next/server";
import { ProjectConfigurationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const name = optionalText(body.name);

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe o nome do cliente.",
          ok: false
        },
        { status: 400 }
      );
    }

    await prisma.client.update({
      data: {
        email: optionalText(body.email),
        name,
        notes: optionalText(body.notes),
        phone: optionalText(body.phone)
      },
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível salvar o cliente.",
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

    await prisma.$transaction([
      prisma.project.updateMany({
        data: {
          configurationStatus: ProjectConfigurationStatus.PENDING
        },
        where: {
          clientId: id
        }
      }),
      prisma.client.delete({
        where: {
          id
        }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível remover o cliente.",
        ok: false
      },
      { status: 500 }
    );
  }
}
