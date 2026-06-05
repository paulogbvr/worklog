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
    const clientId = optionalText(body.clientId);
    const hourlyRate = Number(body.hourlyRate);
    const active = body.active !== false;

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe o nome exibido do projeto.",
          ok: false
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
      return NextResponse.json(
        {
          error: "Informe um valor por hora válido.",
          ok: false
        },
        { status: 400 }
      );
    }

    const configurationStatus =
      clientId && hourlyRate > 0
        ? ProjectConfigurationStatus.CONFIGURED
        : ProjectConfigurationStatus.PENDING;

    await prisma.project.update({
      data: {
        active,
        clientId,
        configurationStatus,
        hourlyRate,
        name,
        notes: optionalText(body.notes)
      },
      where: {
        id
      }
    });

    return NextResponse.json({
      configurationStatus,
      ok: true
    });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível salvar o projeto.",
        ok: false
      },
      { status: 500 }
    );
  }
}
