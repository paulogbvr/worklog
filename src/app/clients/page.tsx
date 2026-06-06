import { BriefcaseBusiness, CircleDollarSign, UserRoundCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OperationsPanel } from "@/components/operations-panel";
import { getServerEnvStatus } from "@/lib/env";
import { getDashboardSummary } from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const dashboard = await getDashboardSummary("all");
  const linkedClientIds = new Set(
    dashboard.projects.flatMap((project) => (project.clientId ? [project.clientId] : []))
  );
  const configuredClientIds = new Set(
    dashboard.projects.flatMap((project) =>
      project.clientId && project.statusLabel === "Configurado" ? [project.clientId] : []
    )
  );
  const recentClients = [...dashboard.clients]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Clientes</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Relacionamentos ativos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Dados necessários para vincular projetos e acompanhar cobrança.
        </p>
      </header>

      <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Users, "Total", dashboard.clients.length],
          [BriefcaseBusiness, "Com projetos", linkedClientIds.size],
          [CircleDollarSign, "Com cobrança", configuredClientIds.size],
          [
            UserRoundCheck,
            "Sem projeto",
            dashboard.clients.length - linkedClientIds.size
          ]
        ].map(([Icon, label, value]) => {
          const MetricIcon = Icon as typeof Users;

          return (
            <article
              className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface-soft)] p-4"
              key={label as string}
            >
              <MetricIcon className="size-5 text-[color:var(--text-muted)]" />
              <div>
                <p className="text-xs text-[color:var(--text-soft)]">{label as string}</p>
                <p className="mt-1 text-xl font-semibold">{value as number}</p>
              </div>
            </article>
          );
        })}
      </section>

      <OperationsPanel
        clients={dashboard.clients}
        fixedView="clients"
        payments={dashboard.payments}
        projects={dashboard.projects}
        workOperations={dashboard.workOperations}
      />

      {recentClients.length > 0 ? (
        <section className="mt-6 border-t border-[color:var(--border)] pt-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Últimos cadastrados
          </p>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
            {recentClients.map((client) => (
              <div key={client.id}>
                <p className="text-sm font-medium">{client.name}</p>
                <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                  {client.createdAtLabel}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
