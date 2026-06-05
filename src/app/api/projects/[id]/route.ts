import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, ProjectConfigurationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";

export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseHourlyRate(value: unknown) {
  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  return Number(normalized);
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
    const hourlyRate = parseHourlyRate(body.hourlyRate);
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

    if (!clientId) {
      return NextResponse.json(
        {
          error: "Selecione um cliente.",
          ok: false
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      return NextResponse.json(
        {
          error: "Informe um valor por hora maior que zero.",
          ok: false
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      select: {
        id: true
      },
      where: {
        id
      }
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Projeto não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    const client = await prisma.client.findUnique({
      select: {
        id: true
      },
      where: {
        id: clientId
      }
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "Cliente selecionado não foi encontrado.",
          ok: false
        },
        { status: 400 }
      );
    }

    await prisma.project.update({
      data: {
        active,
        clientId,
        configurationStatus: ProjectConfigurationStatus.CONFIGURED,
        hourlyRate,
        name,
        notes: optionalText(body.notes)
      },
      where: {
        id
      }
    });
    revalidatePath("/", "page");

    return NextResponse.json({
      configurationStatus: ProjectConfigurationStatus.CONFIGURED,
      ok: true
    });
  } catch (error) {
    logPrismaError("project configuration", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
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
        error: "Erro ao salvar configuração do projeto.",
        ok: false
      },
      { status: 500 }
    );
  }
}
