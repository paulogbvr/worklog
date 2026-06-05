import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { OperationsPanel } from "@/components/operations-panel";
import { SyncNowButton } from "@/components/wakatime/sync-now-button";
import { getServerEnvStatus } from "@/lib/env";
import {
  getDashboardSummary,
  type DashboardPeriod
} from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const workflow = [
  {
    id: "projetos",
    label: "Projetos",
    detail: "Projetos reais detectados pelo WakaTime e configurados no WorkLog."
  },
  {
    id: "clientes",
    label: "Clientes",
    detail: "Cliente e valor por hora definidos sem virar um CRM."
  },
  {
    id: "registros",
    label: "Registros",
    detail: "Horas dedicadas ajustadas manualmente quando necessário."
  },
  {
    id: "pagamentos",
    label: "Pagamentos",
    detail: "Recebimentos vinculados ao projeto para calcular saldo pendente."
  }
];

function parsePeriod(value: string | string[] | undefined): DashboardPeriod {
  const period = Array.isArray(value) ? value[0] : value;

  if (period === "7d" || period === "all") {
    return period;
  }

  return "30d";
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  const period = parsePeriod((await searchParams).period);
  const dashboard = await getDashboardSummary(period);
  const envStatus = getServerEnvStatus();

  return (
    <AppShell envStatus={envStatus}>
      <header
        className="flex flex-col gap-5 border-b border-[color:var(--border)] pb-7 md:flex-row md:items-end md:justify-between"
        id="dashboard"
      >
        <div>
          <p className="text-sm text-[color:var(--text-muted)]">Dashboard</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-[color:var(--app-text-strong)] sm:text-5xl">
            Tempo trabalhado, valor recebido e saldo pendente em um painel direto.
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-col md:items-end">
          <SyncNowButton />
          <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[color:var(--text-muted)]">
            Última sincronização
            <strong className="mt-1 block text-[color:var(--app-text-strong)]">
              {dashboard.lastSyncLabel}
            </strong>
          </div>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[color:var(--text-soft)]">
          Período aplicado a horas, pagamentos e valores.
        </p>
        <div
          aria-label="Filtrar dashboard por período"
          className="grid grid-cols-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1"
          role="navigation"
        >
          {(
            [
              ["7d", "7 dias"],
              ["30d", "30 dias"],
              ["all", "Todo período"]
            ] as const
          ).map(([value, label]) => (
            <Link
              aria-current={dashboard.period === value ? "page" : undefined}
              className={[
                "rounded px-3 py-2 text-center text-sm transition-colors",
                dashboard.period === value
                  ? "bg-[var(--active-bg)] font-medium text-[color:var(--app-text-strong)]"
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboard.metrics.map((metric) => (
          <article
            className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-soft)] p-5 shadow-[var(--card-shadow)]"
            key={metric.label}
          >
            <p className="text-sm text-[color:var(--text-muted)]">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-normal">{metric.value}</p>
            <p className="mt-2 text-sm text-[color:var(--text-soft)]">{metric.detail}</p>
          </article>
        ))}
      </div>

      {!dashboard.databaseAvailable ? (
        <section className="mt-4 rounded-lg border border-[color:var(--warning-border)] bg-[var(--warning-bg)] p-4 text-sm text-[color:var(--warning-text)]">
          Banco indisponível no momento. A interface segue ativa e tentará carregar os dados reais na
          próxima requisição.
        </section>
      ) : null}

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Fluxo principal</h2>
              <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                Dados reais entram pelo backend.
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--text-muted)]">
              Base
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {workflow.map((item, index) => (
              <div
                className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4"
                id={item.id}
                key={item.label}
              >
                <p className="text-xs text-[color:var(--text-faint)]">0{index + 1}</p>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-2 text-sm leading-5 text-[color:var(--text-soft)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-semibold">Operação atual</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs text-[color:var(--text-soft)]">Projetos ativos</p>
              <p className="mt-2 text-2xl font-semibold">{dashboard.activeProjects}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs text-[color:var(--text-soft)]">Pendentes</p>
              <p className="mt-2 text-2xl font-semibold">{dashboard.pendingProjects}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs text-[color:var(--text-soft)]">Configurados</p>
              <p className="mt-2 text-2xl font-semibold">{dashboard.configuredProjects}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs text-[color:var(--text-soft)]">Clientes</p>
              <p className="mt-2 text-2xl font-semibold">{dashboard.clients.length}</p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
            <div className="h-full w-[35%] rounded-full bg-[var(--app-text-strong)] opacity-70" />
          </div>
          <p className="mt-3 text-xs text-[color:var(--text-soft)]">Sincronização real WakaTime</p>
        </section>
      </div>

      <OperationsPanel
        clients={dashboard.clients}
        payments={dashboard.payments}
        projects={dashboard.projects}
        workOperations={dashboard.workOperations}
      />
    </AppShell>
  );
}
