import Link from "next/link";
import { BriefcaseBusiness, Clock3, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardFilters } from "@/components/dashboard-filters";
import { getServerEnvStatus } from "@/lib/env";
import {
  formatDuration,
  getDashboardSummary,
  type DashboardPeriod
} from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";

function parsePeriod(value: string | string[] | undefined): DashboardPeriod {
  const period = Array.isArray(value) ? value[0] : value;

  if (period === "30d" || period === "all") {
    return period;
  }

  return "7d";
}

export default async function RecordsPage({
  searchParams
}: {
  searchParams: Promise<{
    period?: string | string[];
    project?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const project = Array.isArray(params.project) ? params.project[0] : params.project;
  const dashboard = await getDashboardSummary(period, project);
  const totalSeconds = dashboard.workOperations.reduce(
    (total, operation) => total + operation.durationSeconds,
    0
  );

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm text-[color:var(--text-muted)]">Registros</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Histórico detalhado</h1>
          </div>
          <DashboardFilters
            basePath="/records"
            period={dashboard.period}
            projectId={dashboard.selectedProjectId}
            projects={dashboard.projectOptions}
          />
        </div>
      </header>

      <section className="flex flex-col gap-4 border-b border-[color:var(--border)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">Operações</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.workOperations.length}</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">Tempo dedicado</p>
            <p className="mt-1 text-xl font-semibold">{formatDuration(totalSeconds)}</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">Projetos no filtro</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.projects.length}</p>
          </div>
        </div>
        <Link
          className="button-primary inline-flex h-10 w-fit items-center gap-2 self-end px-3 text-sm font-medium sm:self-auto"
          href="/operations"
        >
          <Plus className="size-4" />
          Adicionar operação
        </Link>
      </section>

      <section className="divide-y divide-[color:var(--border)]">
        {dashboard.workOperations.length > 0 ? (
          dashboard.workOperations.map((operation) => (
            <article
              className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              key={operation.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <BriefcaseBusiness className="size-4 text-[color:var(--text-muted)]" />
                  <h2 className="font-medium">{operation.projectName}</h2>
                  <span className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs text-[color:var(--text-muted)]">
                    {operation.intervals.length}{" "}
                    {operation.intervals.length === 1 ? "intervalo" : "intervalos"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  {operation.note ?? "Sem observação"}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-soft)]">
                  {operation.intervals.map((interval) => (
                    <span key={interval.id}>{interval.periodLabel}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock3 className="size-4 text-[color:var(--text-muted)]" />
                {operation.durationLabel}
              </div>
            </article>
          ))
        ) : (
          <p className="py-10 text-sm text-[color:var(--text-soft)]">
            Nenhum registro encontrado para o filtro atual.
          </p>
        )}
      </section>
    </AppShell>
  );
}
