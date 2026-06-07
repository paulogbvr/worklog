import { SyncProvider } from "@prisma/client";
import type { StatusTone } from "@/components/status-pulse";
import {
  resolveClientStatus,
  type ClientStatusValue
} from "@/lib/client-status";
import { prisma } from "@/lib/prisma";
import {
  getPaymentMethodLabel,
  type PaymentMethodValue
} from "@/lib/payment";
import {
  getProjectStatusMeta,
  type ProjectStatusValue
} from "@/lib/project-status";

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
  [key: string]: number | string;
};

export type DashboardChartSeries = {
  color: string;
  dedicatedKey: string;
  generatedKey: string;
  hoursKey: string;
  id: string;
  name: string;
  receivedKey: string;
  wakatimeKey: string;
};

export type DashboardClient = {
  address: string | null;
  birthDate: string | null;
  createdAt: string;
  createdAtLabel: string;
  email: string | null;
  id: string;
  name: string;
  notes: string | null;
  phone: string | null;
  projectCount: number;
  status: ClientStatusValue | null;
  statusLabel: string;
  statusTone: StatusTone;
  taxId: string | null;
};

export type DashboardPayment = {
  amount: number;
  amountLabel: string;
  clientName: string | null;
  clientPhone: string | null;
  hasReceipt: boolean;
  hasInvoice: boolean;
  id: string;
  invoiceKey: string | null;
  invoiceMimeType: string | null;
  invoiceName: string | null;
  invoiceSize: number | null;
  method: PaymentMethodValue;
  methodLabel: string;
  messageDateLabel: string;
  note: string | null;
  notified: boolean;
  paidAt: string;
  paidAtLabel: string;
  projectId: string;
  projectName: string;
  receiptMimeType: string | null;
  receiptName: string | null;
  receiptSize: number | null;
  sharePath: string | null;
};

export type DashboardProject = {
  active: boolean;
  billDedicated: boolean;
  billingMode: "FIXED" | "HOURLY";
  chargeDedicated: boolean;
  chargeWakaTime: boolean;
  clientId: string | null;
  clientName: string | null;
  clientPhone: string | null;
  reminderEnabled: boolean;
  reminderAmountMode: "FIXED" | "PENDING";
  reminderFixedAmount: number | null;
  reminderDueDate: string | null;
  reminderMessage: string | null;
  reminderStatus: "ACTIVE" | "DISABLED" | "SENT" | null;
  reminderStatusLabel: string | null;
  reminderStatusTone: StatusTone;
  comparisonDelta: number;
  comparisonDeltaLabel: string;
  comparisonPositive: boolean;
  dedicatedHourlyRate: number | null;
  dedicatedLabel: string;
  dedicatedValueLabel: string;
  fixedPrice: number | null;
  fixedPriceLabel: string;
  globalDedicatedLabel: string;
  globalWakaTimeLabel: string;
  hourlyRate: number | null;
  hoursComparisonLabel: string;
  id: string;
  lastPaymentLabel: string;
  lastSyncLabel: string;
  name: string;
  notes: string | null;
  pendingIsCredit: boolean;
  pendingValue: number;
  pendingValueLabel: string;
  projectStatus: ProjectStatusValue;
  projectStatusBadgeClass: string;
  projectStatusLabel: string;
  projectStatusTone: StatusTone;
  receivedValue: number;
  receivedValueLabel: string;
  repositoryUrl: string | null;
  shareAccessCount: number;
  shareLastAccessedLabel: string;
  sharePath: string | null;
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
  chartSeries: DashboardChartSeries[];
  clients: DashboardClient[];
  configuredProjects: number;
  databaseAvailable: boolean;
  globalDedicatedLabel: string;
  globalPendingValue: number;
  globalPendingValueLabel: string;
  globalWakaTimeLabel: string;
  lastSyncLabel: string;
  latestSyncSuccessful: boolean;
  metrics: DashboardMetric[];
  payments: DashboardPayment[];
  pendingProjects: number;
  period: DashboardPeriod;
  periodDedicatedLabel: string;
  periodGeneratedValue: number;
  periodGeneratedValueLabel: string;
  periodPendingValueLabel: string;
  periodReceivedValue: number;
  periodReceivedValueLabel: string;
  periodWakaTimeLabel: string;
  projectOptions: Array<{ id: string; name: string }>;
  projects: DashboardProject[];
  selectedProjectId: string | null;
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

function formatPaymentMessageDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TIME_ZONE
  })
    .format(date)
    .replace(",", " -");
}

function formatClientCreatedAt(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
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
    chartSeries: [],
    clients: [],
    configuredProjects: 0,
    databaseAvailable,
    globalDedicatedLabel: "0h",
    globalPendingValue: 0,
    globalPendingValueLabel: "R$ 0,00",
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
    periodDedicatedLabel: "0h",
    periodGeneratedValue: 0,
    periodGeneratedValueLabel: "R$ 0,00",
    periodPendingValueLabel: "R$ 0,00",
    periodReceivedValue: 0,
    periodReceivedValueLabel: "R$ 0,00",
    periodWakaTimeLabel: "0h",
    projectOptions: [],
    projects: [],
    selectedProjectId: null,
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
  [key: string]: number;
};

function getChartPoint(
  chartByDate: Map<string, ChartAccumulator>,
  dateKey: string
) {
  const current = chartByDate.get(dateKey) ?? {
    total: 0
  };

  chartByDate.set(dateKey, current);
  return current;
}

const PROJECT_COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#a78bfa",
  "#22d3ee",
  "#fb7185",
  "#a3e635"
];

function getSeriesKeys(index: number) {
  const prefix = `project${index}`;

  return {
    dedicatedKey: `${prefix}Dedicated`,
    generatedKey: `${prefix}Generated`,
    hoursKey: `${prefix}Hours`,
    receivedKey: `${prefix}Received`,
    wakatimeKey: `${prefix}WakaTime`
  };
}

export async function getDashboardSummary(
  period: DashboardPeriod = "7d",
  requestedProjectId?: string | null
): Promise<DashboardSummary> {
  const startKey = getPeriodStartKey(period);
  let projects;

  try {
    projects = await prisma.project.findMany({
      orderBy: [{ configurationStatus: "asc" }, { updatedAt: "desc" }],
      select: {
        active: true,
        billDedicated: true,
        billingMode: true,
        client: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        clientId: true,
        configurationStatus: true,
        createdAt: true,
        dedicatedHourlyRate: true,
        fixedPrice: true,
        hourlyRate: true,
        id: true,
        lastSyncAt: true,
        name: true,
        notes: true,
        paymentReminder: {
          select: {
            amountMode: true,
            dueDate: true,
            fixedAmount: true,
            message: true,
            status: true
          }
        },
        payments: {
          orderBy: {
            paidAt: "asc"
          },
          select: {
            amount: true,
            createdAt: true,
            id: true,
            invoiceKey: true,
            invoiceMimeType: true,
            invoiceName: true,
            invoicePath: true,
            invoiceSize: true,
            method: true,
            note: true,
            paidAt: true,
            receiptMimeType: true,
            receiptName: true,
            receiptPath: true,
            receiptSize: true,
            whatsappNotifiedAt: true
          }
        },
        repositoryUrl: true,
        status: true,
        shareLinks: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            accessCount: true,
            active: true,
            lastAccessedAt: true,
            slug: true
          },
          take: 1
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
          createdAt: true,
          email: true,
          id: true,
          name: true,
          notes: true,
          phone: true,
          status: true,
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
  const selectedProjectId = projects.some((project) => project.id === requestedProjectId)
    ? requestedProjectId ?? null
    : null;
  const filteredProjects = selectedProjectId
    ? projects.filter((project) => project.id === selectedProjectId)
    : projects;
  const chartSeries = filteredProjects.map<DashboardChartSeries>((project, index) => ({
    color: PROJECT_COLORS[index % PROJECT_COLORS.length],
    id: project.id,
    name: project.name,
    ...getSeriesKeys(index)
  }));

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
  let globalGeneratedValue = 0;
  let globalReceivedValue = 0;

  const projectSummaries = filteredProjects.map<DashboardProject>((project, projectIndex) => {
    const series = chartSeries[projectIndex];
    const hourlyRate = project.hourlyRate ? Number(project.hourlyRate) : null;
    const dedicatedHourlyRate = project.dedicatedHourlyRate
      ? Number(project.dedicatedHourlyRate)
      : null;
    const chargeWakaTime = Boolean(hourlyRate && hourlyRate > 0);
    const chargeDedicated = Boolean(
      project.billDedicated && dedicatedHourlyRate && dedicatedHourlyRate > 0
    );
    const isFixed = project.billingMode === "FIXED";
    const fixedPrice = project.fixedPrice ? Number(project.fixedPrice) : null;
    const contractedValue = isFixed && fixedPrice && fixedPrice > 0 ? fixedPrice : 0;
    const isConfigured =
      project.configurationStatus === "CONFIGURED" &&
      Boolean(project.clientId) &&
      (isFixed ? contractedValue > 0 : chargeWakaTime || chargeDedicated);
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
    const allWakaTimeValue =
      isConfigured && chargeWakaTime && hourlyRate
        ? (allWakaTimeSeconds / 3600) * hourlyRate
        : 0;
    const allDedicatedValue =
      isConfigured && chargeDedicated && dedicatedHourlyRate
        ? (allDedicatedSeconds / 3600) * dedicatedHourlyRate
        : 0;
    const allReceivedValue = project.payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );
    const wakatimeValue =
      isConfigured && !isFixed && chargeWakaTime && hourlyRate
        ? (wakatimeSeconds / 3600) * hourlyRate
        : 0;
    const dedicatedValue =
      isConfigured && !isFixed && chargeDedicated && dedicatedHourlyRate
        ? (dedicatedSeconds / 3600) * dedicatedHourlyRate
        : 0;
    const hourlyTotalValue = wakatimeValue + dedicatedValue;
    // Hours-based value over the whole project, computed from whatever rates are
    // set even in fixed mode, so the admin comparison "preço fechado vs horas"
    // is always available.
    const comparisonWakaRate = hourlyRate && hourlyRate > 0 ? hourlyRate : 0;
    const comparisonDedicatedRate =
      project.billDedicated && dedicatedHourlyRate && dedicatedHourlyRate > 0
        ? dedicatedHourlyRate
        : 0;
    const hoursValueAllTime =
      (allWakaTimeSeconds / 3600) * comparisonWakaRate +
      (allDedicatedSeconds / 3600) * comparisonDedicatedRate;
    const allReceivedValueTotal = allReceivedValue;
    const periodReceivedValue = periodPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );
    // Fixed-price projects track the contract as a whole, so generated/received
    // are all-time; hourly projects stay scoped to the selected period.
    const totalValue = isFixed ? contractedValue : hourlyTotalValue;
    const receivedValue = isFixed ? allReceivedValueTotal : periodReceivedValue;
    const pendingValue = totalValue - receivedValue;
    const comparisonDelta = hoursValueAllTime - contractedValue;
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
      const hours = day.totalSeconds / 3600;
      point[series.wakatimeKey] = (point[series.wakatimeKey] ?? 0) + hours;
      point[series.hoursKey] = (point[series.hoursKey] ?? 0) + hours;

      if (isConfigured && !isFixed && chargeWakaTime && hourlyRate) {
        point[series.generatedKey] =
          (point[series.generatedKey] ?? 0) + hours * hourlyRate;
      }
    }

    for (const entry of periodWorkEntries) {
      const point = getChartPoint(chartByDate, getLocalDateKey(entry.startedAt));
      const hours = entry.durationSeconds / 3600;
      point[series.dedicatedKey] = (point[series.dedicatedKey] ?? 0) + hours;
      point[series.hoursKey] = (point[series.hoursKey] ?? 0) + hours;

      if (isConfigured && !isFixed && chargeDedicated && dedicatedHourlyRate) {
        point[series.generatedKey] =
          (point[series.generatedKey] ?? 0) + hours * dedicatedHourlyRate;
      }
    }

    for (const payment of periodPayments) {
      const point = getChartPoint(chartByDate, getLocalDateKey(payment.paidAt));
      point[series.receivedKey] =
        (point[series.receivedKey] ?? 0) + Number(payment.amount);
    }

    totalWakaTimeSeconds += wakatimeSeconds;
    totalDedicatedSeconds += dedicatedSeconds;
    globalWakaTimeSeconds += allWakaTimeSeconds;
    globalDedicatedSeconds += allDedicatedSeconds;
    totalGeneratedValue += totalValue;
    totalReceivedValue += receivedValue;
    globalGeneratedValue += isFixed ? contractedValue : allWakaTimeValue + allDedicatedValue;
    globalReceivedValue += allReceivedValue;

    const shareLink = project.shareLinks[0];
    const projectStatus = getProjectStatusMeta(project.status);
    const reminder = project.paymentReminder;
    const reminderDueDateKey = reminder
      ? getDatabaseDateKey(reminder.dueDate)
      : null;
    let reminderStatusLabel: string | null = null;
    let reminderStatusTone: StatusTone = "neutral";

    if (reminder) {
      if (reminder.status === "SENT") {
        reminderStatusLabel = "Enviado";
        reminderStatusTone = "success";
      } else if (reminderDueDateKey && reminderDueDateKey < todayKey) {
        reminderStatusLabel = "Vencido";
        reminderStatusTone = "error";
      } else if (reminderDueDateKey === todayKey) {
        reminderStatusLabel = "Hoje";
        reminderStatusTone = "warning";
      } else {
        reminderStatusLabel = "Ativo";
        reminderStatusTone = "neutral";
      }
    }

    return {
      active: project.active,
      billDedicated: project.billDedicated,
      billingMode: project.billingMode,
      chargeDedicated,
      chargeWakaTime,
      clientId: project.clientId,
      clientName: project.client?.name ?? null,
      clientPhone: project.client?.phone ?? null,
      reminderEnabled: Boolean(reminder && reminder.status !== "DISABLED"),
      reminderAmountMode: reminder?.amountMode ?? "PENDING",
      reminderFixedAmount: reminder?.fixedAmount ? Number(reminder.fixedAmount) : null,
      reminderDueDate: reminderDueDateKey,
      reminderMessage: reminder?.message ?? null,
      reminderStatus: reminder?.status ?? null,
      reminderStatusLabel,
      reminderStatusTone,
      comparisonDelta,
      comparisonDeltaLabel: `${comparisonDelta >= 0 ? "+" : "-"}${formatCurrency(
        Math.abs(comparisonDelta)
      )}`,
      comparisonPositive: comparisonDelta >= 0,
      dedicatedHourlyRate,
      dedicatedLabel: formatDuration(dedicatedSeconds),
      dedicatedValueLabel: formatCurrency(dedicatedValue),
      fixedPrice,
      fixedPriceLabel: formatCurrency(contractedValue),
      globalDedicatedLabel: formatDuration(allDedicatedSeconds),
      globalWakaTimeLabel: formatDuration(allWakaTimeSeconds),
      hourlyRate,
      hoursComparisonLabel: formatCurrency(hoursValueAllTime),
      id: project.id,
      lastPaymentLabel: formatDate(lastPayment?.paidAt),
      lastSyncLabel: formatDateTime(project.lastSyncAt),
      name: project.name,
      notes: project.notes,
      pendingIsCredit: pendingValue < 0,
      pendingValue,
      pendingValueLabel: formatCurrency(Math.abs(pendingValue)),
      projectStatus: projectStatus.value,
      projectStatusBadgeClass: projectStatus.badgeClass,
      projectStatusLabel: projectStatus.label,
      projectStatusTone: projectStatus.tone,
      receivedValue,
      receivedValueLabel: formatCurrency(receivedValue),
      repositoryUrl: project.repositoryUrl,
      shareAccessCount: shareLink?.accessCount ?? 0,
      shareLastAccessedLabel: formatDateTime(shareLink?.lastAccessedAt),
      sharePath: shareLink?.active ? `/share/${shareLink.slug}` : null,
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

  const workOperations = filteredProjects
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
  const payments = filteredProjects
    .flatMap((project) =>
      project.payments
        .filter((payment) => isInPeriod(getLocalDateKey(payment.paidAt), startKey))
        .map((payment) => ({
          ...payment,
          clientName: project.client?.name ?? null,
          clientPhone: project.client?.phone ?? null,
          projectId: project.id,
          projectName: project.name,
          sharePath: project.shareLinks[0]?.active
            ? `/share/${project.shareLinks[0].slug}`
            : null
        }))
    )
    .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
  const pendingValue = totalGeneratedValue - totalReceivedValue;
  const globalPendingValue = globalGeneratedValue - globalReceivedValue;
  const pendingProjects = projectSummaries.filter(
    (project) => project.statusLabel === "Pendente"
  ).length;
  const configuredProjects = projectSummaries.length - pendingProjects;

  return {
    activeProjects: projectSummaries.length,
    chartData: [...chartByDate.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([date, point]) =>
        Object.fromEntries([
          ["date", date],
          ["label", formatChartDate(date)],
          ...Object.entries(point)
            .filter(([key]) => key !== "total")
            .map(([key, value]) => [key, Number(value.toFixed(2))])
        ])
      ),
    chartSeries,
    clients: clients.map((client) => {
      const projectCount = activeProjectCountByClient.get(client.id) ?? 0;
      const clientStatus = resolveClientStatus(client.status, projectCount);

      return {
        address: client.address,
        birthDate: client.birthDate?.toISOString().slice(0, 10) ?? null,
        createdAt: client.createdAt.toISOString(),
        createdAtLabel: formatClientCreatedAt(client.createdAt),
        email: client.email,
        id: client.id,
        name: client.name,
        notes: client.notes,
        phone: client.phone,
        projectCount,
        status: client.status,
        statusLabel: clientStatus.label,
        statusTone: clientStatus.tone,
        taxId: client.taxId
      };
    }),
    configuredProjects,
    databaseAvailable: true,
    globalDedicatedLabel: formatDuration(globalDedicatedSeconds),
    globalPendingValue,
    globalPendingValueLabel: formatCurrency(globalPendingValue),
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
      clientName: payment.clientName,
      clientPhone: payment.clientPhone,
      hasReceipt: Boolean(payment.receiptPath || payment.receiptSize),
      hasInvoice: Boolean(payment.invoicePath || payment.invoiceSize),
      id: payment.id,
      invoiceKey: payment.invoiceKey,
      invoiceMimeType: payment.invoiceMimeType,
      invoiceName: payment.invoiceName,
      invoiceSize: payment.invoiceSize,
      method: payment.method,
      methodLabel: getPaymentMethodLabel(payment.method),
      messageDateLabel: formatPaymentMessageDate(payment.createdAt),
      note: payment.note,
      notified: Boolean(payment.whatsappNotifiedAt),
      paidAt: payment.paidAt.toISOString().slice(0, 10),
      paidAtLabel: formatDate(payment.paidAt),
      projectId: payment.projectId,
      projectName: payment.projectName,
      receiptMimeType: payment.receiptMimeType,
      receiptName: payment.receiptName,
      receiptSize: payment.receiptSize,
      sharePath: payment.sharePath
    })),
    pendingProjects,
    period,
    periodDedicatedLabel: formatDuration(totalDedicatedSeconds),
    periodGeneratedValue: totalGeneratedValue,
    periodGeneratedValueLabel: formatCurrency(totalGeneratedValue),
    periodPendingValueLabel: formatCurrency(pendingValue),
    periodReceivedValue: totalReceivedValue,
    periodReceivedValueLabel: formatCurrency(totalReceivedValue),
    periodWakaTimeLabel: formatDuration(totalWakaTimeSeconds),
    projectOptions: projects.map((project) => ({
      id: project.id,
      name: project.name
    })),
    projects: projectSummaries,
    selectedProjectId,
    workOperations
  };
}
