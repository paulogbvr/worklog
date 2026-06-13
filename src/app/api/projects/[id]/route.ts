import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  BillingMode,
  NotificationCategory,
  NotificationType,
  Prisma,
  ProjectConfigurationStatus,
  ProjectStatus
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import { getProjectStatusMeta } from "@/lib/project-status";

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

function parseRepositoryUrl(value: unknown) {
  const repositoryUrl = optionalText(value);

  if (!repositoryUrl) {
    return {
      ok: true as const,
      value: null
    };
  }

  try {
    const url = new URL(repositoryUrl);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("invalid protocol");
    }

    return {
      ok: true as const,
      value: url.toString()
    };
  } catch {
    return {
      error: "Informe uma URL válida para o repositório Git.",
      ok: false as const
    };
  }
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
    const fixedPrice = parseHourlyRate(body.fixedPrice);
    const billingMode =
      body.billingMode === "FIXED"
        ? BillingMode.FIXED
        : body.billingMode === "NON_PROFIT"
          ? BillingMode.NON_PROFIT
          : BillingMode.HOURLY;
    const billDedicated = body.billDedicated === true;
    const active = body.active !== false;
    const repositoryUrl = parseRepositoryUrl(body.repositoryUrl);
    const status =
      typeof body.status === "string" &&
      Object.values(ProjectStatus).includes(body.status as ProjectStatus)
        ? (body.status as ProjectStatus)
        : null;

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe o nome exibido do projeto.",
          ok: false
        },
        { status: 400 }
      );
    }

    if (!repositoryUrl.ok) {
      return NextResponse.json(
        {
          error: repositoryUrl.error,
          ok: false
        },
        { status: 400 }
      );
    }

    if (body.status !== undefined && !status) {
      return NextResponse.json(
        {
          error: "Selecione um status de projeto válido.",
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

    if (fixedPrice !== null && (!Number.isFinite(fixedPrice) || fixedPrice < 0)) {
      return NextResponse.json(
        {
          error: "Informe um preço fechado válido ou deixe o campo vazio.",
          ok: false
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      select: {
        id: true,
        name: true,
        shareLinks: {
          select: {
            slug: true
          },
          where: {
            active: true
          }
        },
        status: true
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

    const isNonProfit = billingMode === BillingMode.NON_PROFIT;
    const hasBillableRate =
      Boolean(hourlyRate && hourlyRate > 0) ||
      Boolean(billDedicated && dedicatedHourlyRate && dedicatedHourlyRate > 0);
    const hasFixedPrice = Boolean(fixedPrice && fixedPrice > 0);
    const isBillable =
      billingMode === BillingMode.FIXED ? hasFixedPrice : hasBillableRate;
    // Free / non-profit projects never charge, so they are considered fully
    // configured on their own (no client or rate required).
    const configurationStatus =
      isNonProfit || (clientId && isBillable)
        ? ProjectConfigurationStatus.CONFIGURED
        : ProjectConfigurationStatus.PENDING;
    const nextStatus = status ?? project.status;
    const projectUpdate = prisma.project.update({
      data: {
        active,
        billDedicated,
        billingMode,
        clientId,
        configurationStatus,
        dedicatedHourlyRate,
        fixedPrice,
        hourlyRate,
        name,
        notes: optionalText(body.notes),
        repositoryUrl: repositoryUrl.value,
        status: nextStatus
      },
      where: {
        id
      }
    });

    if (nextStatus !== project.status) {
      const statusMeta = getProjectStatusMeta(nextStatus);

      await prisma.$transaction([
        projectUpdate,
        prisma.projectStatusEvent.create({
          data: {
            fromStatus: project.status,
            projectId: id,
            toStatus: nextStatus
          }
        }),
        prisma.notification.create({
          data: {
            category: NotificationCategory.IMPORTANT,
            message: `Projeto ${name} alterado para ${statusMeta.label}.`,
            projectId: id,
            title: "Status do projeto atualizado",
            type: NotificationType.PROJECT_STATUS_CHANGED
          }
        })
      ]);
    } else {
      await projectUpdate;
    }

    revalidatePath("/", "page");
    revalidatePath("/projects", "page");
    revalidatePath("/notifications", "page");

    for (const shareLink of project.shareLinks) {
      revalidatePath(`/share/${shareLink.slug}`, "page");
      revalidatePath(`/share/${shareLink.slug}/opengraph-image`);
      revalidatePath(`/share/${shareLink.slug}/pdf`);
    }

    return NextResponse.json({
      billDedicated,
      configurationStatus,
      ok: true,
      status: nextStatus
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
