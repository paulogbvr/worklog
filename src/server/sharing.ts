import {
  NotificationCategory,
  NotificationType,
  ShareEventType
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentMethodLabel } from "@/lib/payment";
import { getProjectStatusMeta } from "@/lib/project-status";
import { formatCurrency, formatDuration } from "@/server/dashboard/summary";

const TIME_ZONE = "America/Sao_Paulo";

// Fallback label used on the public page when a project has no linked client.
// Shared so share notifications can tell a real client apart from this default.
export const INDEPENDENT_CLIENT_LABEL = "Projeto independente";

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
          billingMode: true,
          client: {
            select: {
              name: true
            }
          },
          configurationStatus: true,
          dedicatedHourlyRate: true,
          fixedPrice: true,
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
              invoiceKey: true,
              invoiceMimeType: true,
              invoicePath: true,
              invoiceSize: true,
              method: true,
              note: true,
              paidAt: true,
              receiptMimeType: true,
              receiptPath: true,
              receiptSize: true
            }
          },
          repositoryUrl: true,
          siteUrl: true,
          status: true,
          statusEvents: {
            orderBy: {
              createdAt: "desc"
            },
            select: {
              createdAt: true,
              fromStatus: true,
              id: true,
              toStatus: true
            }
          },
          updatedAt: true,
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
  const isFixed = project.billingMode === "FIXED";
  const isNonProfit = project.billingMode === "NON_PROFIT";
  const fixedPrice = project.fixedPrice ? Number(project.fixedPrice) : 0;
  const hoursValue =
    (hourlyRate > 0 ? (wakaSeconds / 3600) * hourlyRate : 0) +
    (project.billDedicated && dedicatedHourlyRate > 0
      ? (dedicatedSeconds / 3600) * dedicatedHourlyRate
      : 0);
  // Fixed-price contracts expose the agreed total; hourly projects expose the
  // value accrued from tracked hours. Non-profit projects never charge, so all
  // money figures stay at zero. The internal "hours vs fixed" comparison is
  // intentionally not surfaced publicly.
  const generatedValue = isNonProfit ? 0 : isFixed ? fixedPrice : isConfigured ? hoursValue : 0;
  const receivedValue = isNonProfit
    ? 0
    : project.payments.reduce((total, payment) => total + Number(payment.amount), 0);
  const pendingValue = generatedValue - receivedValue;
  const projectStatus = getProjectStatusMeta(project.status);

  return {
    billingMode: project.billingMode,
    isNonProfit,
    clientName: project.client?.name ?? INDEPENDENT_CLIENT_LABEL,
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
      hasReceipt: Boolean(payment.receiptPath || payment.receiptSize),
      hasInvoice: Boolean(payment.invoicePath || payment.invoiceSize),
      id: payment.id,
      invoiceIsImage: Boolean(payment.invoiceMimeType?.startsWith("image/")),
      invoiceIsViewable: Boolean(
        payment.invoiceMimeType?.startsWith("image/") ||
          payment.invoiceMimeType === "application/pdf"
      ),
      invoiceKey: payment.invoiceKey,
      methodLabel: getPaymentMethodLabel(payment.method),
      note: payment.note,
      receiptIsImage: Boolean(payment.receiptMimeType?.startsWith("image/")),
      receiptMimeType: payment.receiptMimeType
    })),
    pendingIsCredit: pendingValue < 0,
    pendingValueLabel: formatCurrency(Math.abs(pendingValue)),
    projectId: project.id,
    receivedValueLabel: formatCurrency(receivedValue),
    repositoryUrl: project.repositoryUrl,
    siteUrl: project.siteUrl,
    statusBadgeClass: projectStatus.badgeClass,
    statusLabel: projectStatus.label,
    statusTone: projectStatus.tone,
    timeline: [
      ...project.statusEvents.map((event) => {
        const nextStatus = getProjectStatusMeta(event.toStatus);
        const previousStatus = event.fromStatus
          ? getProjectStatusMeta(event.fromStatus)
          : null;

        return {
          category: "updates" as const,
          date: event.createdAt,
          detail: previousStatus
            ? `${previousStatus.label} → ${nextStatus.label}`
            : `Status definido como ${nextStatus.label}.`,
          id: `status-${event.id}`,
          title: `Status alterado para ${nextStatus.label}`
        };
      }),
      ...(project.lastSyncAt
        ? [
            {
              category: "updates" as const,
              date: project.lastSyncAt,
              detail: `Horas do projeto atualizadas em ${formatDateTime(project.lastSyncAt)}.`,
              id: "last-sync",
              title: "Dados sincronizados"
            }
          ]
        : []),
      ...(project.notes?.trim()
        ? [
            {
              category: "updates" as const,
              date: project.updatedAt,
              detail: project.notes.trim(),
              id: "project-note",
              title: "Observação do projeto"
            }
          ]
        : []),
      ...project.payments.map((payment) => ({
        category: "payments" as const,
        date: payment.paidAt,
        detail: [
          `${formatCurrency(Number(payment.amount))} via ${getPaymentMethodLabel(payment.method)}.`,
          payment.note,
          payment.receiptPath || payment.receiptSize ? "Comprovante anexado." : null,
          payment.invoicePath || payment.invoiceSize ? "Nota fiscal anexada." : null
        ]
          .filter((item): item is string => Boolean(item))
          .join(" "),
        id: `payment-${payment.id}`,
        title: "Pagamento registrado"
      })),
      ...project.workLogEntries.slice(0, 20).map((entry) => ({
        category: "updates" as const,
        date: entry.startedAt,
        detail: `${formatDuration(entry.durationSeconds)}${entry.note ? ` · ${entry.note}` : ""}`,
        id: `work-${entry.id}`,
        title: "Trabalho dedicado"
      }))
    ]
      .sort((first, second) => second.date.getTime() - first.date.getTime())
      .slice(0, 50)
      .map((item) => ({
        category: item.category,
        dateLabel: formatDateTime(item.date),
        detail: item.detail,
        id: item.id,
        title: item.title
      })),
    wakaTimeLabel: formatDuration(wakaSeconds)
  };
}

type ShareEventInput = {
  clientName?: string | null;
  projectId: string;
  projectName: string;
  shareLinkId: string;
};

export async function recordShareEvent(
  input: ShareEventInput,
  type: ShareEventType
) {
  // Only mention the client when it's a real linked one (not the public-page
  // fallback label), so the notification stays accurate.
  const hasClient = Boolean(
    input.clientName && input.clientName !== INDEPENDENT_CLIENT_LABEL
  );
  const clientSuffix = hasClient ? ` Cliente: ${input.clientName}.` : "";
  const content = {
    [ShareEventType.ACCESS]: {
      message: `O link compartilhado do projeto ${input.projectName} foi aberto.${clientSuffix}`,
      title: "Link compartilhado aberto",
      notificationType: NotificationType.SHARE_ACCESSED
    },
    [ShareEventType.COPY_LINK]: {
      message: `O link público do projeto ${input.projectName} foi copiado.${clientSuffix}`,
      title: "Link público copiado",
      notificationType: NotificationType.SHARE_COPIED
    },
    [ShareEventType.PDF_DOWNLOAD]: {
      message: `O acompanhamento do projeto ${input.projectName} foi salvo em PDF.${clientSuffix}`,
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
