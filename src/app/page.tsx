import { Clock3, Code2, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardFilters } from "@/components/dashboard-filters";
import { StatusPulse } from "@/components/status-pulse";
import { SyncNowButton } from "@/components/wakatime/sync-now-button";
import { getServerEnvStatus } from "@/lib/env";
import {
  getDashboardSummary,
  type DashboardPeriod
} from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parsePeriod(value: string | string[] | undefined): DashboardPeriod {
  const period = Array.isArray(value) ? value[0] : value;

  if (period === "30d" || period === "all") {
    return period;
  }

  return "7d";
}

function parseProjectId(value: string | string[] | undefined) {
  const projectId = Array.isArray(value) ? value[0] : value;
  return typeof projectId === "string" && projectId.trim() ? projectId : null;
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{
    period?: string | string[];
    project?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const dashboard = await getDashboardSummary(period, parseProjectId(params.project));
  const envStatus = getServerEnvStatus();
  const periodContext =
    dashboard.period === "all"
      ? "em todo o histórico"
      : dashboard.period === "30d"
        ? "nos últimos 30 dias"
        : "nos últimos 7 dias";
  const syncTone =
    dashboard.lastSyncLabel === "Não realizada"
      ? "neutral"
      : dashboard.latestSyncSuccessful
        ? "success"
        : "error";

  return (
    <AppShell envStatus={envStatus}>
      <header className="border-b border-[color:var(--border)] pb-6" id="dashboard">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm text-[color:var(--text-muted)]">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-[color:var(--app-text-strong)] sm:text-3xl">
              Visão financeira
            </h1>
          </div>
          <DashboardFilters
            actions={
              <span className="xl:hidden">
                <SyncNowButton />
              </span>
            }
            period={dashboard.period}
            projectId={dashboard.selectedProjectId}
            projects={dashboard.projectOptions}
          />
        </div>

        <div className="mt-3 flex flex-col items-end gap-2">
          <div className="hidden xl:block">
            <SyncNowButton />
          </div>
          <div className="inline-flex w-fit max-w-full items-center gap-2.5 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
            <StatusPulse tone={syncTone} />
            <span className="truncate">Última sincronização</span>
            <strong className="shrink-0 font-medium text-[color:var(--app-text-strong)]">
              {dashboard.lastSyncLabel}
            </strong>
          </div>
        </div>
      </header>

      {!dashboard.databaseAvailable ? (
        <section className="mt-5 rounded-lg border border-[color:var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[color:var(--warning-text)]">
          Banco indisponível no momento. A interface tentará carregar os dados reais na próxima
          requisição.
        </section>
      ) : null}

      <section className="py-7">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            {dashboard.period === "all" ? "Resumo histórico" : "Resumo do período"}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Code2,
              label: `WakaTime ${periodContext}`,
              tone: "bg-blue-500/10 text-blue-400",
              value: dashboard.periodWakaTimeLabel
            },
            {
              icon: Clock3,
              label: `Horas dedicadas ${periodContext}`,
              tone: "bg-amber-500/10 text-amber-500",
              value: dashboard.periodDedicatedLabel
            },
            {
              icon: WalletCards,
              label: `Valor pendente ${periodContext}`,
              tone: "bg-emerald-500/10 text-emerald-400",
              value: dashboard.periodPendingValueLabel
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="flex items-center gap-4 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)]"
                key={item.label}
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-md ${item.tone}`}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs leading-5 text-[color:var(--text-soft)]">{item.label}</p>
                  <p className="mt-1 truncate text-xl font-semibold">{item.value}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <DashboardCharts data={dashboard.chartData} series={dashboard.chartSeries} />

      <section
        className="mt-8 rounded-lg border border-[color:var(--border)] bg-[var(--surface)]"
        id="operacao-atual"
      >
        <div className="flex flex-col gap-4 border-b border-[color:var(--border)] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Operação atual</h2>
            <p className="mt-1 text-sm text-[color:var(--text-soft)]">
              Posição do período por projeto ativo.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center sm:gap-7">
            {[
              ["Ativos", dashboard.activeProjects],
              ["Pendentes", dashboard.pendingProjects],
              ["WakaTime", dashboard.periodWakaTimeLabel],
              ["Dedicadas", dashboard.periodDedicatedLabel]
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-base font-semibold sm:text-lg">{value}</p>
                <p className="text-[10px] uppercase text-[color:var(--text-faint)]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[color:var(--border)] px-5">
          {dashboard.projects.length > 0 ? (
            dashboard.projects.map((project) => (
              <article
                className="grid gap-4 py-5 md:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(110px,.55fr))] md:items-center"
                key={project.id}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-[color:var(--app-text-strong)]">
                      {project.name}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] ${project.projectStatusBadgeClass}`}
                    >
                      <StatusPulse tone={project.projectStatusTone} />
                      {project.projectStatusLabel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-[color:var(--text-soft)]">
                    {project.clientName ?? "Sem cliente"} · último pagamento:{" "}
                    {project.lastPaymentLabel}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4 md:contents md:gap-0 md:rounded-none md:border-0 md:bg-transparent md:p-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                      WakaTime
                    </p>
                    <p className="mt-1 text-sm">{project.wakatimeLabel}</p>
                    <p className="mt-1 hidden text-xs text-[color:var(--text-soft)] md:block">
                      {periodContext}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                      Dedicadas
                    </p>
                    <p className="mt-1 text-sm">{project.dedicatedLabel}</p>
                    <p className="mt-1 hidden text-xs text-[color:var(--text-soft)] md:block">
                      {periodContext}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                      Gerado
                    </p>
                    <p className="mt-1 text-sm">{project.totalValueLabel}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                      Pendente {project.pendingValueLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                      Recebido
                    </p>
                    <p className="mt-1 text-sm">{project.receivedValueLabel}</p>
                    <p className="mt-1 hidden text-xs text-[color:var(--text-soft)] md:block">
                      {periodContext}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[color:var(--text-soft)]">
              Nenhum projeto encontrado para o filtro atual.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
