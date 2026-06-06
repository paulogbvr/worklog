import {
  NotificationCategory,
  NotificationType,
  ShareEventType
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentMethodLabel } from "@/lib/payment";
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
      createdAt: true,
      project: {
        select: {
          active: true,
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
          notes: true,
          payments: {
            orderBy: {
              paidAt: "desc"
            },
            select: {
              amount: true,
              id: true,
              method: true,
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
            orderBy: {
              startedAt: "desc"
            },
            select: {
              durationSeconds: true,
              id: true,
              note: true,
              startedAt: true
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
    createdAtLabel: formatDate(shareLink.createdAt),
    dedicatedLabel: formatDuration(dedicatedSeconds),
    description:
      project.notes?.trim() ||
      `Acompanhamento transparente de horas e pagamentos do projeto ${project.name}.`,
    generatedValueLabel: formatCurrency(generatedValue),
    id: shareLink.id,
    lastSyncLabel: formatDateTime(project.lastSyncAt),
    name: project.name,
    payments: project.payments.map((payment) => ({
      amountLabel: formatCurrency(Number(payment.amount)),
      dateLabel: formatDate(payment.paidAt),
      id: payment.id,
      methodLabel: getPaymentMethodLabel(payment.method),
      note: payment.note
    })),
    pendingValueLabel: formatCurrency(generatedValue - receivedValue),
    projectId: project.id,
    receivedValueLabel: formatCurrency(receivedValue),
    repositoryUrl: project.repositoryUrl,
    statusLabel: project.active ? "Em andamento" : "Arquivado",
    timeline: [
      ...(project.lastSyncAt
        ? [
            {
              date: project.lastSyncAt,
              detail: `Horas do projeto atualizadas em ${formatDateTime(project.lastSyncAt)}.`,
              id: "last-sync",
              title: "Dados sincronizados"
            }
          ]
        : []),
      ...project.payments.map((payment) => ({
        date: payment.paidAt,
        detail: `${formatCurrency(Number(payment.amount))} via ${getPaymentMethodLabel(payment.method)}.`,
        id: `payment-${payment.id}`,
        title: "Pagamento registrado"
      })),
      ...project.workLogEntries.slice(0, 8).map((entry) => ({
        date: entry.startedAt,
        detail: `${formatDuration(entry.durationSeconds)}${entry.note ? ` · ${entry.note}` : ""}`,
        id: `work-${entry.id}`,
        title: "Trabalho dedicado"
      }))
    ]
      .sort((first, second) => second.date.getTime() - first.date.getTime())
      .slice(0, 10)
      .map((item) => ({
        dateLabel: formatDateTime(item.date),
        detail: item.detail,
        id: item.id,
        title: item.title
      })),
    wakaTimeLabel: formatDuration(wakaSeconds)
  };
}

type ShareEventInput = {
  projectId: string;
  projectName: string;
  shareLinkId: string;
};

export async function recordShareEvent(
  input: ShareEventInput,
  type: ShareEventType
) {
  const content = {
    [ShareEventType.ACCESS]: {
      message: `O link somente leitura de ${input.projectName} foi visualizado.`,
      title: "Projeto acessado",
      notificationType: NotificationType.SHARE_ACCESSED
    },
    [ShareEventType.COPY_LINK]: {
      message: `O link público de ${input.projectName} foi copiado.`,
      title: "Link público copiado",
      notificationType: NotificationType.SHARE_COPIED
    },
    [ShareEventType.PDF_DOWNLOAD]: {
      message: `O acompanhamento de ${input.projectName} foi salvo em PDF.`,
      title: "Relatório público salvo",
      notificationType: NotificationType.SHARE_PDF_DOWNLOADED
    }
  }[type];

  try {
    if (type === ShareEventType.ACCESS) {
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
        prisma.shareEvent.create({
          data: {
            shareLinkId: input.shareLinkId,
            type
          }
        }),
        prisma.notification.create({
          data: {
            category: NotificationCategory.IMPORTANT,
            message: content.message,
            projectId: input.projectId,
            shareLinkId: input.shareLinkId,
            title: content.title,
            type: content.notificationType
          }
        })
      ]);
    } else {
      await prisma.$transaction([
        prisma.shareEvent.create({
          data: {
            shareLinkId: input.shareLinkId,
            type
          }
        }),
        prisma.notification.create({
          data: {
            category: NotificationCategory.IMPORTANT,
            message: content.message,
            projectId: input.projectId,
            shareLinkId: input.shareLinkId,
            title: content.title,
            type: content.notificationType
          }
        })
      ]);
    }
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error && typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.name
          : "unknown";

    console.error(`[sharing] event record failed (${code})`);
  }
}

export async function recordShareAccess(input: ShareEventInput) {
  return recordShareEvent(input, ShareEventType.ACCESS);
}
