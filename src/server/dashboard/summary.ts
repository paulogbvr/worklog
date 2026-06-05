import { SyncProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardProject = {
  id: string;
  name: string;
  statusLabel: string;
  statusTone: "muted" | "warning";
  lastSyncLabel: string;
  wakatimeLabel: string;
};

export type DashboardSummary = {
  activeProjects: number;
  clients: number;
  databaseAvailable: boolean;
  lastSyncLabel: string;
  metrics: DashboardMetric[];
  pendingProjects: number;
  projects: DashboardProject[];
};

function formatDuration(totalSeconds: number) {
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

function formatCurrency(value: number) {
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

function getEmptySummary(databaseAvailable: boolean): DashboardSummary {
  return {
    activeProjects: 0,
    clients: 0,
    databaseAvailable,
    lastSyncLabel: "Não realizada",
    metrics: [
      { detail: "Aguardando sincronização", label: "Horas WakaTime", value: "0h" },
      { detail: "Nenhum registro manual", label: "Horas Dedicadas", value: "0h" },
      { detail: "Sem pagamentos", label: "Valor Recebido", value: "R$ 0,00" },
      { detail: "Sem projetos configurados", label: "Valor Pendente", value: "R$ 0,00" }
    ],
    pendingProjects: 0,
    projects: []
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const [
      wakatimeAggregate,
      projects,
      activeProjects,
      pendingProjects,
      clients,
      latestSync
    ] = await Promise.all([
      prisma.wakaTimeProjectDay.aggregate({
        _sum: {
          totalSeconds: true
        }
      }),
      prisma.project.findMany({
        orderBy: {
          updatedAt: "desc"
        },
        select: {
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
          workLogEntries: {
            select: {
              durationSeconds: true
            }
          }
        }
      }),
      prisma.project.count({
        where: {
          active: true
        }
      }),
      prisma.project.count({
        where: {
          configurationStatus: "PENDING"
        }
      }),
      prisma.client.count(),
      prisma.syncLog.findFirst({
        orderBy: {
          startedAt: "desc"
        },
        where: {
          provider: SyncProvider.WAKATIME
        }
      })
    ]);

    const wakatimeSeconds = wakatimeAggregate._sum.totalSeconds ?? 0;
    const dedicatedSeconds = projects.reduce(
      (total, project) =>
        total +
        project.workLogEntries.reduce(
          (projectTotal, entry) => projectTotal + entry.durationSeconds,
          0
        ),
      0
    );

    const totalValue = projects.reduce((total, project) => {
      const projectSeconds = project.workLogEntries.reduce(
        (projectTotal, entry) => projectTotal + entry.durationSeconds,
        0
      );
      const hourlyRate = project.hourlyRate ? Number(project.hourlyRate) : 0;

      return total + (projectSeconds / 3600) * hourlyRate;
    }, 0);

    const receivedValue = projects.reduce(
      (total, project) =>
        total +
        project.payments.reduce((projectTotal, payment) => projectTotal + Number(payment.amount), 0),
      0
    );
    const pendingValue = totalValue - receivedValue;
    const projectSummaries = projects.slice(0, 6).map<DashboardProject>((project) => {
      const wakatimeSeconds = project.wakatimeDays.reduce(
        (total, day) => total + day.totalSeconds,
        0
      );
      const isPending = project.configurationStatus === "PENDING";

      return {
        id: project.id,
        lastSyncLabel: formatDateTime(project.lastSyncAt),
        name: project.name,
        statusLabel: isPending ? "Pendente" : "Configurado",
        statusTone: isPending ? "warning" : "muted",
        wakatimeLabel: formatDuration(wakatimeSeconds)
      };
    });

    return {
      activeProjects,
      clients,
      databaseAvailable: true,
      lastSyncLabel: formatDateTime(latestSync?.finishedAt ?? latestSync?.startedAt),
      metrics: [
        {
          detail:
            wakatimeSeconds > 0
              ? "Tempo real importado do WakaTime"
              : "Aguardando sincronização",
          label: "Horas WakaTime",
          value: formatDuration(wakatimeSeconds)
        },
        {
          detail:
            dedicatedSeconds > 0
              ? "Tempo faturável registrado no WorkLog"
              : "Nenhum registro manual",
          label: "Horas Dedicadas",
          value: formatDuration(dedicatedSeconds)
        },
        {
          detail: receivedValue > 0 ? "Pagamentos registrados" : "Sem pagamentos",
          label: "Valor Recebido",
          value: formatCurrency(receivedValue)
        },
        {
          detail:
            pendingValue > 0 ? "Saldo calculado por projeto" : "Sem projetos configurados",
          label: "Valor Pendente",
          value: formatCurrency(pendingValue)
        }
      ],
      pendingProjects,
      projects: projectSummaries
    };
  } catch {
    return getEmptySummary(false);
  }
}
