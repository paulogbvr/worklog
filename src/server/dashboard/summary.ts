import { SyncProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "America/Sao_Paulo";

export type DashboardPeriod = "7d" | "30d" | "all";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardChartPoint = {
  date: string;
  label: string;
  wakatimeHours: number;
  dedicatedHours: number;
  generatedValue: number;
  receivedValue: number;
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
  billDedicated: boolean;
  chargeDedicated: boolean;
  chargeWakaTime: boolean;
  clientId: string | null;
  clientName: string | null;
  dedicatedHourlyRate: number | null;
  dedicatedLabel: string;
  dedicatedValueLabel: string;
  globalDedicatedLabel: string;
  globalWakaTimeLabel: string;
  hourlyRate: number | null;
  id: string;
  lastPaymentLabel: string;
  lastSyncLabel: string;
  name: string;
  notes: string | null;
  pendingValue: number;
  pendingValueLabel: string;
  receivedValue: number;
  sinceLastPaymentDedicatedLabel: string;
  sinceLastPaymentValueLabel: string;
  sinceLastPaymentWakaTimeLabel: string;
  statusLabel: string;
  statusTone: "muted" | "warning";
  totalValue: number;
  totalValueLabel: string;
  wakatimeLabel: string;
  wakatimeProjectName: string | null;
  wakatimeValueLabel: string;
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
  chartData: DashboardChartPoint[];
  clients: DashboardClient[];
  configuredProjects: number;
  databaseAvailable: boolean;
  globalDedicatedLabel: string;
  globalWakaTimeLabel: string;
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
    timeZone: TIME_ZONE
  }).format(date);
}

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "Nenhum pagamento";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: TIME_ZONE
  }).format(date);
}

function getLocalDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: TIME_ZONE,
    year: "numeric"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((parts, part) => {
      if (part.type === "day" || part.type === "month" || part.type === "year") {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getDatabaseDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatChartDate(dateKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC"
  })
    .format(new Date(`${dateKey}T12:00:00.000Z`))
    .replace(".", "");
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getPeriodStartKey(period: DashboardPeriod) {
  if (period === "all") {
    return null;
  }

  return addDays(getLocalDateKey(new Date()), period === "7d" ? -6 : -29);
}

function isInPeriod(dateKey: string, startKey: string | null) {
  return !startKey || dateKey >= startKey;
}

function getEmptySummary(
  databaseAvailable: boolean,
  period: DashboardPeriod
): DashboardSummary {
  return {
    activeProjects: 0,
    chartData: [],
    clients: [],
    configuredProjects: 0,
    databaseAvailable,
    globalDedicatedLabel: "0h",
    globalWakaTimeLabel: "0h",
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

type ChartAccumulator = {
  dedicatedHours: number;
  generatedValue: number;
  receivedValue: number;
  wakatimeHours: number;
};

function getChartPoint(
  chartByDate: Map<string, ChartAccumulator>,
  dateKey: string
) {
  const current = chartByDate.get(dateKey) ?? {
    dedicatedHours: 0,
    generatedValue: 0,
    receivedValue: 0,
    wakatimeHours: 0
  };

  chartByDate.set(dateKey, current);
  return current;
}

export async function getDashboardSummary(
  period: DashboardPeriod = "30d"
): Promise<DashboardSummary> {
  const startKey = getPeriodStartKey(period);
  let projects;

  try {
    projects = await prisma.project.findMany({
      orderBy: [{ configurationStatus: "asc" }, { updatedAt: "desc" }],
      select: {
        active: true,
        billDedicated: true,
        client: {
          select: {
            id: true,
            name: true
          }
        },
        clientId: true,
        configurationStatus: true,
        dedicatedHourlyRate: true,
        hourlyRate: true,
        id: true,
        lastSyncAt: true,
        name: true,
        notes: true,
        payments: {
          orderBy: {
            paidAt: "asc"
          },
          select: {
            amount: true,
            id: true,
            note: true,
            paidAt: true
          }
        },
        wakatimeDays: {
          orderBy: {
            date: "asc"
          },
          select: {
            date: true,
            totalSeconds: true
          }
        },
        wakatimeProjectName: true,
        workLogEntries: {
          orderBy: {
            startedAt: "asc"
          },
          select: {
            durationSeconds: true,
            endedAt: true,
            id: true,
            note: true,
            operationId: true,
            startedAt: true
          }
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

  const chartByDate = new Map<string, ChartAccumulator>();
  const todayKey = getLocalDateKey(new Date());

  if (startKey) {
    for (let dateKey = startKey; dateKey <= todayKey; dateKey = addDays(dateKey, 1)) {
      getChartPoint(chartByDate, dateKey);
    }
  }

  let totalWakaTimeSeconds = 0;
  let totalDedicatedSeconds = 0;
  let globalWakaTimeSeconds = 0;
  let globalDedicatedSeconds = 0;
  let totalGeneratedValue = 0;
  let totalReceivedValue = 0;

  const projectSummaries = projects.map<DashboardProject>((project) => {
    const hourlyRate = project.hourlyRate ? Number(project.hourlyRate) : null;
    const dedicatedHourlyRate = project.dedicatedHourlyRate
      ? Number(project.dedicatedHourlyRate)
      : null;
    const chargeWakaTime = Boolean(hourlyRate && hourlyRate > 0);
    const chargeDedicated = Boolean(
      project.billDedicated && dedicatedHourlyRate && dedicatedHourlyRate > 0
    );
    const isConfigured =
      project.configurationStatus === "CONFIGURED" &&
      Boolean(project.clientId) &&
      (chargeWakaTime || chargeDedicated);
    const periodWakaDays = project.wakatimeDays.filter((day) =>
      isInPeriod(getDatabaseDateKey(day.date), startKey)
    );
    const periodWorkEntries = project.workLogEntries.filter((entry) =>
      isInPeriod(getLocalDateKey(entry.startedAt), startKey)
    );
    const periodPayments = project.payments.filter((payment) =>
      isInPeriod(getLocalDateKey(payment.paidAt), startKey)
    );
    const wakatimeSeconds = periodWakaDays.reduce(
      (total, day) => total + day.totalSeconds,
      0
    );
    const dedicatedSeconds = periodWorkEntries.reduce(
      (total, entry) => total + entry.durationSeconds,
      0
    );
    const allWakaTimeSeconds = project.wakatimeDays.reduce(
      (total, day) => total + day.totalSeconds,
      0
    );
    const allDedicatedSeconds = project.workLogEntries.reduce(
      (total, entry) => total + entry.durationSeconds,
      0
    );
    const wakatimeValue =
      isConfigured && chargeWakaTime && hourlyRate
        ? (wakatimeSeconds / 3600) * hourlyRate
        : 0;
    const dedicatedValue =
      isConfigured && chargeDedicated && dedicatedHourlyRate
        ? (dedicatedSeconds / 3600) * dedicatedHourlyRate
        : 0;
    const totalValue = wakatimeValue + dedicatedValue;
    const receivedValue = periodPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );
    const pendingValue = totalValue - receivedValue;
    const lastPayment = project.payments.at(-1) ?? null;
    const sinceLastPaymentWakaTimeSeconds = project.wakatimeDays
      .filter(
        (day) =>
          !lastPayment ||
          getDatabaseDateKey(day.date) >= getLocalDateKey(lastPayment.paidAt)
      )
      .reduce((total, day) => total + day.totalSeconds, 0);
    const sinceLastPaymentDedicatedSeconds = project.workLogEntries
      .filter((entry) => !lastPayment || entry.startedAt >= lastPayment.paidAt)
      .reduce((total, entry) => total + entry.durationSeconds, 0);
    const sinceLastPaymentValue =
      (isConfigured && chargeWakaTime && hourlyRate
        ? (sinceLastPaymentWakaTimeSeconds / 3600) * hourlyRate
        : 0) +
      (isConfigured && chargeDedicated && dedicatedHourlyRate
        ? (sinceLastPaymentDedicatedSeconds / 3600) * dedicatedHourlyRate
        : 0);

    for (const day of periodWakaDays) {
      const point = getChartPoint(chartByDate, getDatabaseDateKey(day.date));
      point.wakatimeHours += day.totalSeconds / 3600;

      if (isConfigured && chargeWakaTime && hourlyRate) {
        point.generatedValue += (day.totalSeconds / 3600) * hourlyRate;
      }
    }

    for (const entry of periodWorkEntries) {
      const point = getChartPoint(chartByDate, getLocalDateKey(entry.startedAt));
      point.dedicatedHours += entry.durationSeconds / 3600;

      if (isConfigured && chargeDedicated && dedicatedHourlyRate) {
        point.generatedValue += (entry.durationSeconds / 3600) * dedicatedHourlyRate;
      }
    }

    for (const payment of periodPayments) {
      getChartPoint(
        chartByDate,
        getLocalDateKey(payment.paidAt)
      ).receivedValue += Number(payment.amount);
    }

    totalWakaTimeSeconds += wakatimeSeconds;
    totalDedicatedSeconds += dedicatedSeconds;
    globalWakaTimeSeconds += allWakaTimeSeconds;
    globalDedicatedSeconds += allDedicatedSeconds;
    totalGeneratedValue += totalValue;
    totalReceivedValue += receivedValue;

    return {
      active: project.active,
      billDedicated: project.billDedicated,
      chargeDedicated,
      chargeWakaTime,
      clientId: project.clientId,
      clientName: project.client?.name ?? null,
      dedicatedHourlyRate,
      dedicatedLabel: formatDuration(dedicatedSeconds),
      dedicatedValueLabel: formatCurrency(dedicatedValue),
      globalDedicatedLabel: formatDuration(allDedicatedSeconds),
      globalWakaTimeLabel: formatDuration(allWakaTimeSeconds),
      hourlyRate,
      id: project.id,
      lastPaymentLabel: formatDate(lastPayment?.paidAt),
      lastSyncLabel: formatDateTime(project.lastSyncAt),
      name: project.name,
      notes: project.notes,
      pendingValue,
      pendingValueLabel: formatCurrency(pendingValue),
      receivedValue,
      sinceLastPaymentDedicatedLabel: formatDuration(
        sinceLastPaymentDedicatedSeconds
      ),
      sinceLastPaymentValueLabel: formatCurrency(sinceLastPaymentValue),
      sinceLastPaymentWakaTimeLabel: formatDuration(
        sinceLastPaymentWakaTimeSeconds
      ),
      statusLabel: isConfigured ? "Configurado" : "Pendente",
      statusTone: isConfigured ? "muted" : "warning",
      totalValue,
      totalValueLabel: formatCurrency(totalValue),
      wakatimeLabel: formatDuration(wakatimeSeconds),
      wakatimeProjectName: project.wakatimeProjectName,
      wakatimeValueLabel: formatCurrency(wakatimeValue)
    };
  });

  if (chartByDate.size === 0) {
    getChartPoint(chartByDate, todayKey);
  }

  const workOperations = projects
    .flatMap((project) => {
      const entriesInPeriod = project.workLogEntries.filter((entry) =>
        isInPeriod(getLocalDateKey(entry.startedAt), startKey)
      );
      const operations = new Map<string, typeof entriesInPeriod>();

      for (const entry of entriesInPeriod) {
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
  const payments = projects
    .flatMap((project) =>
      project.payments
        .filter((payment) => isInPeriod(getLocalDateKey(payment.paidAt), startKey))
        .map((payment) => ({
          ...payment,
          projectId: project.id,
          projectName: project.name
        }))
    )
    .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
    .slice(0, 10);
  const pendingValue = totalGeneratedValue - totalReceivedValue;
  const pendingProjects = projectSummaries.filter(
    (project) => project.statusLabel === "Pendente"
  ).length;
  const configuredProjects = projectSummaries.length - pendingProjects;

  return {
    activeProjects: projectSummaries.length,
    chartData: [...chartByDate.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([date, point]) => ({
        date,
        dedicatedHours: Number(point.dedicatedHours.toFixed(2)),
        generatedValue: Number(point.generatedValue.toFixed(2)),
        label: formatChartDate(date),
        receivedValue: Number(point.receivedValue.toFixed(2)),
        wakatimeHours: Number(point.wakatimeHours.toFixed(2))
      })),
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
    globalDedicatedLabel: formatDuration(globalDedicatedSeconds),
    globalWakaTimeLabel: formatDuration(globalWakaTimeSeconds),
    lastSyncLabel: formatDateTime(latestSync?.finishedAt ?? latestSync?.startedAt),
    latestSyncSuccessful: latestSync?.success ?? false,
    metrics: [
      {
        detail:
          totalWakaTimeSeconds > 0
            ? "Tempo importado no período"
            : "Aguardando sincronização",
        label: "Horas WakaTime",
        value: formatDuration(totalWakaTimeSeconds)
      },
      {
        detail:
          totalDedicatedSeconds > 0
            ? "Tempo manual no período"
            : "Nenhum registro no período",
        label: "Horas Dedicadas",
        value: formatDuration(totalDedicatedSeconds)
      },
      {
        detail: `${configuredProjects} projetos com cobrança`,
        label: "Valor Gerado",
        value: formatCurrency(totalGeneratedValue)
      },
      {
        detail: totalReceivedValue > 0 ? "Pagamentos no período" : "Sem pagamentos",
        label: "Valor Recebido",
        value: formatCurrency(totalReceivedValue)
      },
      {
        detail: pendingValue !== 0 ? "Gerado menos recebido" : "Sem saldo pendente",
        label: "Valor Pendente",
        value: formatCurrency(pendingValue)
      }
    ],
    payments: payments.map((payment) => ({
      amount: Number(payment.amount),
      amountLabel: formatCurrency(Number(payment.amount)),
      id: payment.id,
      note: payment.note,
      paidAtLabel: formatDate(payment.paidAt),
      projectId: payment.projectId,
      projectName: payment.projectName
    })),
    pendingProjects,
    period,
    projects: projectSummaries,
    workOperations
  };
}
