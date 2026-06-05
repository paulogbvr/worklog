import { ProjectBillingMode, SyncProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardPeriod = "7d" | "30d" | "all";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardClient = {
  address: string | null;
  birthDate: string | null;
  email: string | null;
  id: string;
  name: string;
  notes: string | null;
  phone: string | null;
  projectCount: number;
  taxId: string | null;
};

export type DashboardPayment = {
  amount: number;
  amountLabel: string;
  id: string;
  note: string | null;
  paidAtLabel: string;
  projectId: string;
  projectName: string;
};

export type DashboardProject = {
  active: boolean;
  billingMode: ProjectBillingMode;
  billingSource: "manual" | "wakatime";
  billableSeconds: number;
  clientId: string | null;
  clientName: string | null;
  dedicatedLabel: string;
  hourlyRate: number | null;
  id: string;
  lastSyncLabel: string;
  name: string;
  notes: string | null;
  pendingValue: number;
  pendingValueLabel: string;
  receivedValue: number;
  statusLabel: string;
  statusTone: "muted" | "warning";
  totalValue: number;
  totalValueLabel: string;
  wakatimeLabel: string;
  wakatimeProjectName: string | null;
};

export type DashboardWorkInterval = {
  durationLabel: string;
  durationSeconds: number;
  endedAt: string;
  id: string;
  periodLabel: string;
  startedAt: string;
};

export type DashboardWorkOperation = {
  durationLabel: string;
  durationSeconds: number;
  id: string;
  intervals: DashboardWorkInterval[];
  note: string | null;
  periodLabel: string;
  projectId: string;
  projectName: string;
  startedAt: string;
};

export type DashboardSummary = {
  activeProjects: number;
  clients: DashboardClient[];
  configuredProjects: number;
  databaseAvailable: boolean;
  lastSyncLabel: string;
  latestSyncSuccessful: boolean;
  metrics: DashboardMetric[];
  payments: DashboardPayment[];
  pendingProjects: number;
  period: DashboardPeriod;
  projects: DashboardProject[];
  workOperations: DashboardWorkOperation[];
};

export function formatDuration(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return "0h";
  }

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency"
  }).format(value);
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) {
    return "Não realizada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(date);
}

function getEmptySummary(
  databaseAvailable: boolean,
  period: DashboardPeriod
): DashboardSummary {
  return {
    activeProjects: 0,
    clients: [],
    configuredProjects: 0,
    databaseAvailable,
    lastSyncLabel: "Não realizada",
    latestSyncSuccessful: false,
    metrics: [
      { detail: "Aguardando sincronização", label: "Horas WakaTime", value: "0h" },
      { detail: "Nenhum registro manual", label: "Horas Dedicadas", value: "0h" },
      { detail: "Sem projetos configurados", label: "Valor Gerado", value: "R$ 0,00" },
      { detail: "Sem pagamentos", label: "Valor Recebido", value: "R$ 0,00" },
      { detail: "Sem projetos configurados", label: "Valor Pendente", value: "R$ 0,00" }
    ],
    payments: [],
    pendingProjects: 0,
    period,
    projects: [],
    workOperations: []
  };
}

function logDashboardError(scope: string, error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error && typeof error.code === "string"
      ? error.code
      : error instanceof Error
        ? error.name
        : "unknown";

  console.error(`[dashboard] ${scope} failed (${code})`);
}

async function readOptional<T>(
  scope: string,
  read: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    logDashboardError(scope, error);
    return fallback;
  }
}

function getPeriodRange(period: DashboardPeriod) {
  if (period === "all") {
    return null;
  }

  const todayParts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
    year: "numeric"
  })
    .formatToParts(new Date())
    .reduce<Record<string, number>>((parts, part) => {
      if (part.type === "day" || part.type === "month" || part.type === "year") {
        parts[part.type] = Number(part.value);
      }

      return parts;
    }, {});
  const days = period === "7d" ? 7 : 30;
  const startDate = new Date(
    Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day - (days - 1))
  );
  const startInstant = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  return {
    startDate,
    startInstant
  };
}

export async function getDashboardSummary(
  period: DashboardPeriod = "30d"
): Promise<DashboardSummary> {
  const periodRange = getPeriodRange(period);
  let projects;

  try {
    projects = await prisma.project.findMany({
      orderBy: [{ configurationStatus: "asc" }, { updatedAt: "desc" }],
      select: {
        active: true,
        client: {
          select: {
            id: true,
            name: true
          }
        },
        clientId: true,
        billingMode: true,
        configurationStatus: true,
        hourlyRate: true,
        id: true,
        lastSyncAt: true,
        name: true,
        payments: {
          select: {
            amount: true
          },
          where: periodRange
            ? {
                paidAt: {
                  gte: periodRange.startDate
                }
              }
            : undefined
        },
        wakatimeDays: {
          select: {
            totalSeconds: true
          },
          where: periodRange
            ? {
                date: {
                  gte: periodRange.startDate
                }
              }
            : undefined
        },
        wakatimeProjectName: true,
        workLogEntries: {
          select: {
            durationSeconds: true,
            endedAt: true,
            id: true,
            note: true,
            operationId: true,
            startedAt: true
          },
          where: periodRange
            ? {
                startedAt: {
                  gte: periodRange.startInstant
                }
              }
            : undefined
        }
      },
      where: {
        active: true
      }
    });
  } catch (error) {
    logDashboardError("active projects", error);
    return getEmptySummary(false, period);
  }

  const activeProjectIds = projects.map((project) => project.id);
  const projectNotes = await readOptional(
    "project notes",
    () =>
      prisma.project.findMany({
        select: {
          id: true,
          notes: true
        },
        where: {
          id: {
            in: activeProjectIds
          }
        }
      }),
    []
  );
  const notesByProjectId = new Map(projectNotes.map((project) => [project.id, project.notes]));
  const clients = await readOptional(
    "clients",
    () =>
      prisma.client.findMany({
        orderBy: {
          name: "asc"
        },
        select: {
          address: true,
          birthDate: true,
          email: true,
          id: true,
          name: true,
          notes: true,
          phone: true,
          taxId: true
        }
      }),
    []
  );
  const latestSync = await readOptional(
    "latest sync",
    () =>
      prisma.syncLog.findFirst({
        orderBy: {
          startedAt: "desc"
        },
        where: {
          provider: SyncProvider.WAKATIME
        }
      }),
    null
  );
  const recentPayments = await readOptional(
    "recent payments",
    () =>
      prisma.payment.findMany({
        orderBy: {
          paidAt: "desc"
        },
        select: {
          amount: true,
          id: true,
          note: true,
          paidAt: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 10,
        where: {
          paidAt: periodRange
            ? {
                gte: periodRange.startDate
              }
            : undefined,
          projectId: {
            in: activeProjectIds
          }
        }
      }),
    []
  );

  let totalWakaTimeSeconds = 0;
  let totalDedicatedSeconds = 0;
  let totalGeneratedValue = 0;
  let totalReceivedValue = 0;

  const projectSummaries = projects.map<DashboardProject>((project) => {
    const wakatimeSeconds = project.wakatimeDays.reduce(
      (total, day) => total + day.totalSeconds,
      0
    );
    const dedicatedSeconds = project.workLogEntries.reduce(
      (total, entry) => total + entry.durationSeconds,
      0
    );
    const billableSeconds =
      project.billingMode === ProjectBillingMode.DEDICATED
        ? dedicatedSeconds
        : wakatimeSeconds;
    const hourlyRate = project.hourlyRate ? Number(project.hourlyRate) : null;
    const isConfigured =
      project.configurationStatus === "CONFIGURED" &&
      Boolean(project.clientId) &&
      Boolean(hourlyRate && hourlyRate > 0);
    const totalValue = isConfigured && hourlyRate ? (billableSeconds / 3600) * hourlyRate : 0;
    const receivedValue = project.payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );
    const pendingValue = totalValue - receivedValue;

    totalWakaTimeSeconds += wakatimeSeconds;
    totalDedicatedSeconds += dedicatedSeconds;
    totalGeneratedValue += totalValue;
    totalReceivedValue += receivedValue;

    return {
      active: project.active,
      billingMode: project.billingMode,
      billingSource:
        project.billingMode === ProjectBillingMode.DEDICATED ? "manual" : "wakatime",
      billableSeconds,
      clientId: project.clientId,
      clientName: project.client?.name ?? null,
      dedicatedLabel: formatDuration(dedicatedSeconds),
      hourlyRate,
      id: project.id,
      lastSyncLabel: formatDateTime(project.lastSyncAt),
      name: project.name,
      notes: notesByProjectId.get(project.id) ?? null,
      pendingValue,
      pendingValueLabel: formatCurrency(pendingValue),
      receivedValue,
      statusLabel: isConfigured ? "Configurado" : "Pendente",
      statusTone: isConfigured ? "muted" : "warning",
      totalValue,
      totalValueLabel: formatCurrency(totalValue),
      wakatimeLabel: formatDuration(wakatimeSeconds),
      wakatimeProjectName: project.wakatimeProjectName
    };
  });

  const pendingValue = totalGeneratedValue - totalReceivedValue;
  const pendingProjects = projectSummaries.filter(
    (project) => project.statusLabel === "Pendente"
  ).length;
  const configuredProjects = projectSummaries.length - pendingProjects;
  const workOperations = projects
    .flatMap((project) => {
      const operations = new Map<string, typeof project.workLogEntries>();

      for (const entry of project.workLogEntries) {
        const operation = operations.get(entry.operationId) ?? [];
        operation.push(entry);
        operations.set(entry.operationId, operation);
      }

      return [...operations.entries()].map<DashboardWorkOperation>(
        ([operationId, entries]) => {
          const sortedEntries = [...entries].sort(
            (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
          );
          const durationSeconds = sortedEntries.reduce(
            (total, entry) => total + entry.durationSeconds,
            0
          );
          const intervals = sortedEntries.map<DashboardWorkInterval>((entry) => ({
            durationLabel: formatDuration(entry.durationSeconds),
            durationSeconds: entry.durationSeconds,
            endedAt: entry.endedAt.toISOString(),
            id: entry.id,
            periodLabel: `${formatDateTime(entry.startedAt)} → ${formatDateTime(entry.endedAt)}`,
            startedAt: entry.startedAt.toISOString()
          }));

          return {
            durationLabel: formatDuration(durationSeconds),
            durationSeconds,
            id: operationId,
            intervals,
            note: sortedEntries[0]?.note ?? null,
            periodLabel: intervals.map((interval) => interval.periodLabel).join(" · "),
            projectId: project.id,
            projectName: project.name,
            startedAt: sortedEntries[0].startedAt.toISOString()
          };
        }
      );
    })
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const activeProjectCountByClient = projects.reduce((counts, project) => {
    if (project.clientId) {
      counts.set(project.clientId, (counts.get(project.clientId) ?? 0) + 1);
    }

    return counts;
  }, new Map<string, number>());

  return {
    activeProjects: projectSummaries.length,
    clients: clients.map((client) => ({
      address: client.address,
      birthDate: client.birthDate?.toISOString().slice(0, 10) ?? null,
      email: client.email,
      id: client.id,
      name: client.name,
      notes: client.notes,
      phone: client.phone,
      projectCount: activeProjectCountByClient.get(client.id) ?? 0,
      taxId: client.taxId
    })),
    configuredProjects,
    databaseAvailable: true,
    lastSyncLabel: formatDateTime(latestSync?.finishedAt ?? latestSync?.startedAt),
    latestSyncSuccessful: latestSync?.success ?? false,
    metrics: [
      {
        detail:
          totalWakaTimeSeconds > 0
            ? "Tempo real importado do WakaTime"
            : "Aguardando sincronização",
        label: "Horas WakaTime",
        value: formatDuration(totalWakaTimeSeconds)
      },
      {
        detail:
          totalDedicatedSeconds > 0
            ? "Tempo manual registrado no período"
            : "Nenhum registro manual no período",
        label: "Horas Dedicadas",
        value: formatDuration(totalDedicatedSeconds)
      },
      {
        detail: `${configuredProjects} projetos configurados`,
        label: "Valor Gerado",
        value: formatCurrency(totalGeneratedValue)
      },
      {
        detail: totalReceivedValue > 0 ? "Pagamentos registrados" : "Sem pagamentos",
        label: "Valor Recebido",
        value: formatCurrency(totalReceivedValue)
      },
      {
        detail: pendingValue !== 0 ? "Saldo calculado por projeto" : "Sem saldo pendente",
        label: "Valor Pendente",
        value: formatCurrency(pendingValue)
      }
    ],
    payments: recentPayments.map((payment) => ({
      amount: Number(payment.amount),
      amountLabel: formatCurrency(Number(payment.amount)),
      id: payment.id,
      note: payment.note,
      paidAtLabel: formatDate(payment.paidAt),
      projectId: payment.project.id,
      projectName: payment.project.name
    })),
    pendingProjects,
    period,
    projects: projectSummaries,
    workOperations
  };
}
