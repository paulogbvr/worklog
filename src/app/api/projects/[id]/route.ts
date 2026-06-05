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
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;

  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);
  return parsed === 0 ? null : parsed;
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
    const dedicatedHourlyRate = parseHourlyRate(body.dedicatedHourlyRate);
    const billDedicated = body.billDedicated === true;
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

    if (hourlyRate !== null && (!Number.isFinite(hourlyRate) || hourlyRate < 0)) {
      return NextResponse.json(
        {
          error: "Informe um valor por hora válido ou deixe o campo vazio.",
          ok: false
        },
        { status: 400 }
      );
    }

    if (
      dedicatedHourlyRate !== null &&
      (!Number.isFinite(dedicatedHourlyRate) || dedicatedHourlyRate < 0)
    ) {
      return NextResponse.json(
        {
          error: "Informe um valor válido para horas dedicadas ou deixe o campo vazio.",
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

    if (clientId) {
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
    }

    const hasBillableRate =
      Boolean(hourlyRate && hourlyRate > 0) ||
      Boolean(billDedicated && dedicatedHourlyRate && dedicatedHourlyRate > 0);
    const configurationStatus =
      clientId && hasBillableRate
        ? ProjectConfigurationStatus.CONFIGURED
        : ProjectConfigurationStatus.PENDING;

    await prisma.project.update({
      data: {
        active,
        billDedicated,
        clientId,
        configurationStatus,
        dedicatedHourlyRate,
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
      billDedicated,
      configurationStatus,
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
