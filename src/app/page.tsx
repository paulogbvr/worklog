import { AppShell } from "@/components/app-shell";
import { SyncNowButton } from "@/components/wakatime/sync-now-button";
import { getServerEnvStatus } from "@/lib/env";
import { getDashboardSummary } from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const envStatus = getServerEnvStatus();
  const dashboard = await getDashboardSummary();

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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <p className="text-xs text-[color:var(--text-soft)]">Clientes</p>
              <p className="mt-2 text-2xl font-semibold">{dashboard.clients}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-xs text-[color:var(--text-soft)]">M3</p>
              <p className="mt-2 text-2xl font-semibold">Sync</p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
            <div className="h-full w-[35%] rounded-full bg-[var(--app-text-strong)] opacity-70" />
          </div>
          <p className="mt-3 text-xs text-[color:var(--text-soft)]">Sincronização real WakaTime</p>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Projetos sincronizados</h2>
            <p className="mt-1 text-sm text-[color:var(--text-soft)]">
              Projetos reais detectados pelo WakaTime.
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--text-muted)]">
            {dashboard.pendingProjects} pendentes
          </span>
        </div>

        <div className="mt-5 divide-y divide-[color:var(--border)]">
          {dashboard.projects.length > 0 ? (
            dashboard.projects.map((project) => (
              <div
                className="grid gap-3 py-4 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                key={project.id}
              >
                <div>
                  <p className="font-medium text-[color:var(--app-text-strong)]">{project.name}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Última sync: {project.lastSyncLabel}
                  </p>
                </div>
                <span
                  className={[
                    "w-fit rounded-full border px-2.5 py-1 text-xs",
                    project.statusTone === "warning"
                      ? "border-[color:var(--warning-border)] bg-[var(--warning-bg)] text-[color:var(--warning-text)]"
                      : "border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)]"
                  ].join(" ")}
                >
                  {project.statusLabel}
                </span>
                <span className="text-[color:var(--text-muted)]">{project.wakatimeLabel}</span>
                <span className="text-xs text-[color:var(--text-faint)]">WakaTime</span>
              </div>
            ))
          ) : (
            <div className="py-6 text-sm text-[color:var(--text-soft)]">
              Nenhum projeto sincronizado ainda.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
