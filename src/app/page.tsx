import Link from "next/link";
import { Clock3, Code2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardCharts } from "@/components/dashboard-charts";
import {
  OperationsPanel,
  type OperationView
} from "@/components/operations-panel";
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

  if (period === "7d" || period === "all") {
    return period;
  }

  return "30d";
}

function parseOperationView(
  value: string | string[] | undefined
): OperationView | null {
  const view = Array.isArray(value) ? value[0] : value;

  if (
    view === "clients" ||
    view === "payments" ||
    view === "projects" ||
    view === "records"
  ) {
    return view;
  }

  return null;
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{
    period?: string | string[];
    view?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const requestedView = parseOperationView(params.view);
  const initialView = requestedView ?? "projects";
  const dashboard = await getDashboardSummary(period);
  const envStatus = getServerEnvStatus();

  return (
    <AppShell activeOperationView={requestedView} envStatus={envStatus}>
      <header
        className="border-b border-[color:var(--border)] pb-6"
        id="dashboard"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[color:var(--text-muted)]">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-[color:var(--app-text-strong)] sm:text-3xl">
              Visão financeira
            </h1>
          </div>
          <div
            aria-label="Filtrar dashboard por período"
            className="grid w-fit grid-cols-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1"
            role="navigation"
          >
            {(
              [
                ["7d", "7D"],
                ["30d", "30D"],
                ["all", "ALL"]
              ] as const
            ).map(([value, label]) => (
              <Link
                aria-current={dashboard.period === value ? "page" : undefined}
                className={[
                  "min-w-12 rounded px-3 py-2 text-center text-xs font-medium transition-colors",
                  dashboard.period === value
                    ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)]"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
                ].join(" ")}
                href={`/?period=${value}#dashboard`}
                key={value}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SyncNowButton />
          <div className="inline-flex w-fit max-w-full items-center gap-2.5 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span className="truncate">Última sincronização</span>
            <strong className="shrink-0 font-medium text-[color:var(--app-text-strong)]">
              {dashboard.lastSyncLabel}
            </strong>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {dashboard.metrics.map((metric) => (
          <article
            className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-soft)] p-4 shadow-[var(--card-shadow)]"
            key={metric.label}
          >
            <p className="text-xs text-[color:var(--text-muted)]">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-normal">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--text-soft)]">
              {metric.detail}
            </p>
          </article>
        ))}
      </div>

      {!dashboard.databaseAvailable ? (
        <section className="mt-4 rounded-lg border border-[color:var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[color:var(--warning-text)]">
          Banco indisponível no momento. A interface tentará carregar os dados reais na próxima
          requisição.
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 border-y border-[color:var(--border)] py-5 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-blue-500/10 text-blue-400">
            <Code2 className="size-5" />
          </span>
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">WakaTime em todo o histórico</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.globalWakaTimeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-amber-500/10 text-amber-500">
            <Clock3 className="size-5" />
          </span>
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">Horas dedicadas em todo o histórico</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.globalDedicatedLabel}</p>
          </div>
        </div>
      </section>

      <DashboardCharts data={dashboard.chartData} />

      <section
        className="mt-8 rounded-lg border border-[color:var(--border)] bg-[var(--surface)]"
        id="operacao-atual"
      >
        <div className="flex flex-col gap-4 border-b border-[color:var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Operação atual</h2>
            <p className="mt-1 text-sm text-[color:var(--text-soft)]">
              Estrutura ativa e posição financeira por projeto.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center sm:gap-6">
            {[
              ["Ativos", dashboard.activeProjects],
              ["Pendentes", dashboard.pendingProjects],
              ["Configurados", dashboard.configuredProjects],
              ["Clientes", dashboard.clients.length]
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-lg font-semibold">{value}</p>
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
                  <p className="truncate font-medium text-[color:var(--app-text-strong)]">
                    {project.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-[color:var(--text-soft)]">
                    {project.clientName ?? "Sem cliente"} · último pagamento:{" "}
                    {project.lastPaymentLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">WakaTime</p>
                  <p className="mt-1 text-sm">{project.wakatimeLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Total {project.globalWakaTimeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Dedicadas</p>
                  <p className="mt-1 text-sm">{project.dedicatedLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Total {project.globalDedicatedLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Gerado</p>
                  <p className="mt-1 text-sm">{project.totalValueLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Pendente {project.pendingValueLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">
                    Desde o último pagamento
                  </p>
                  <p className="mt-1 text-sm">{project.sinceLastPaymentValueLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    {project.sinceLastPaymentWakaTimeLabel} Waka ·{" "}
                    {project.sinceLastPaymentDedicatedLabel} dedicadas
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p className="py-8 text-sm text-[color:var(--text-soft)]">
              Sincronize o WakaTime para iniciar a operação.
            </p>
          )}
        </div>
      </section>

      <OperationsPanel
        clients={dashboard.clients}
        initialView={initialView}
        key={initialView}
        payments={dashboard.payments}
        projects={dashboard.projects}
        workOperations={dashboard.workOperations}
      />
    </AppShell>
  );
}
