import { SyncProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
  projects: DashboardProject[];
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

function getEmptySummary(databaseAvailable: boolean): DashboardSummary {
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
    projects: []
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

export async function getDashboardSummary(): Promise<DashboardSummary> {
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
        configurationStatus: true,
        hourlyRate: true,
        id: true,
        lastSyncAt: true,
        name: true,
        payments: {
          select: {
            amount: true
          }
        },
        wakatimeDays: {
          select: {
            totalSeconds: true
          }
        },
        wakatimeProjectName: true,
        workLogEntries: {
          select: {
            durationSeconds: true
          }
        }
      },
      where: {
        active: true
      }
    });
  } catch (error) {
    logDashboardError("active projects", error);
    return getEmptySummary(false);
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
    const billableSeconds = dedicatedSeconds > 0 ? dedicatedSeconds : wakatimeSeconds;
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
      billingSource: dedicatedSeconds > 0 ? "manual" : "wakatime",
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
            ? "Tempo manual usado como prioridade"
            : "WakaTime será usado como base",
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
    projects: projectSummaries
  };
}
