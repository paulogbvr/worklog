import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { DashboardFilters } from "@/components/dashboard-filters";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardSections } from "@/components/dashboard-sections";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { StatusPulse } from "@/components/status-pulse";
import { SyncNowButton } from "@/components/wakatime/sync-now-button";
import { getServerEnvStatus } from "@/lib/env";
import {
  getDashboardHeader,
  type DashboardPeriod
} from "@/server/dashboard/summary";
import { getProfile } from "@/server/profile";

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
  const projectId = parseProjectId(params.project);
  // Lightweight query so the chrome (greeting, filters, sync, last sync) renders
  // instantly; the heavy data streams in via the Suspense boundary below.
  const [header, profile] = await Promise.all([
    getDashboardHeader(projectId),
    getProfile()
  ]);
  const envStatus = getServerEnvStatus();
  const syncTone =
    header.lastSyncLabel === "Não realizada"
      ? "neutral"
      : header.latestSyncSuccessful
        ? "success"
        : "error";

  return (
    <AppShell envStatus={envStatus}>
      <header className="border-b border-[color:var(--border)] pb-6" id="dashboard">
        <div>
          <p className="text-sm text-[color:var(--text-muted)]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-[color:var(--app-text-strong)] sm:text-3xl">
            <DashboardGreeting name={profile.name} />
          </h1>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <DashboardFilters
            period={period}
            projectId={header.selectedProjectId}
            projects={header.projectOptions}
          />

          <div className="flex flex-col items-end gap-2">
            <SyncNowButton />
            <div className="inline-flex w-fit max-w-full items-center gap-2.5 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs text-[color:var(--text-muted)]">
              <StatusPulse tone={syncTone} />
              <span className="truncate">Última sincronização</span>
              <strong className="shrink-0 font-medium text-[color:var(--app-text-strong)]">
                {header.lastSyncLabel}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {!header.databaseAvailable ? (
        <section className="mt-5 rounded-lg border border-[color:var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[color:var(--warning-text)]">
          Banco indisponível no momento. A interface tentará carregar os dados reais na próxima
          requisição.
        </section>
      ) : null}

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardSections period={period} projectId={projectId} />
      </Suspense>
    </AppShell>
  );
}
