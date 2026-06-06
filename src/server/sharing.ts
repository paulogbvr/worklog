import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDuration } from "@/server/dashboard/summary";

const TIME_ZONE = "America/Sao_Paulo";

function formatDateTime(date: Date | null) {
  if (!date) {
    return "Não realizada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TIME_ZONE
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: TIME_ZONE
  }).format(date);
}

export async function getPublicProject(slug: string) {
  const shareLink = await prisma.shareLink.findFirst({
    select: {
      id: true,
      project: {
        select: {
          billDedicated: true,
          client: {
            select: {
              name: true
            }
          },
          configurationStatus: true,
          dedicatedHourlyRate: true,
          hourlyRate: true,
          id: true,
          lastSyncAt: true,
          name: true,
          payments: {
            orderBy: {
              paidAt: "desc"
            },
            select: {
              amount: true,
              id: true,
              note: true,
              paidAt: true
            }
          },
          repositoryUrl: true,
          wakatimeDays: {
            select: {
              totalSeconds: true
            }
          },
          workLogEntries: {
            select: {
              durationSeconds: true
            }
          }
        }
      }
    },
    where: {
      active: true,
      slug
    }
  });

  if (!shareLink) {
    return null;
  }

  const project = shareLink.project;
  const wakaSeconds = project.wakatimeDays.reduce(
    (total, day) => total + day.totalSeconds,
    0
  );
  const dedicatedSeconds = project.workLogEntries.reduce(
    (total, entry) => total + entry.durationSeconds,
    0
  );
  const hourlyRate = project.hourlyRate ? Number(project.hourlyRate) : 0;
  const dedicatedHourlyRate = project.dedicatedHourlyRate
    ? Number(project.dedicatedHourlyRate)
    : 0;
  const isConfigured = project.configurationStatus === "CONFIGURED";
  const generatedValue =
    (isConfigured && hourlyRate > 0 ? (wakaSeconds / 3600) * hourlyRate : 0) +
    (isConfigured && project.billDedicated && dedicatedHourlyRate > 0
      ? (dedicatedSeconds / 3600) * dedicatedHourlyRate
      : 0);
  const receivedValue = project.payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  return {
    clientName: project.client?.name ?? "Projeto independente",
    dedicatedLabel: formatDuration(dedicatedSeconds),
    generatedValueLabel: formatCurrency(generatedValue),
    id: shareLink.id,
    lastSyncLabel: formatDateTime(project.lastSyncAt),
    name: project.name,
    payments: project.payments.map((payment) => ({
      amountLabel: formatCurrency(Number(payment.amount)),
      dateLabel: formatDate(payment.paidAt),
      id: payment.id,
      note: payment.note
    })),
    pendingValueLabel: formatCurrency(generatedValue - receivedValue),
    projectId: project.id,
    receivedValueLabel: formatCurrency(receivedValue),
    repositoryUrl: project.repositoryUrl,
    wakaTimeLabel: formatDuration(wakaSeconds)
  };
}

export async function recordShareAccess(input: {
  projectId: string;
  projectName: string;
  shareLinkId: string;
}) {
  try {
    await prisma.$transaction([
      prisma.shareLink.update({
        data: {
          accessCount: {
            increment: 1
          },
          lastAccessedAt: new Date()
        },
        where: {
          id: input.shareLinkId
        }
      }),
      prisma.notification.create({
        data: {
          message: `O link somente leitura de ${input.projectName} foi visualizado.`,
          projectId: input.projectId,
          title: "Projeto acessado",
          type: NotificationType.SHARE_ACCESSED
        }
      })
    ]);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error && typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.name
          : "unknown";

    console.error(`[sharing] access record failed (${code})`);
  }
}
