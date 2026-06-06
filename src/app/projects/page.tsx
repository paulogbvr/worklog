import { FolderKanban, Link2, Settings2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OperationsPanel } from "@/components/operations-panel";
import { getServerEnvStatus } from "@/lib/env";
import { getDashboardSummary } from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const dashboard = await getDashboardSummary("all");

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Projetos</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Configuração e cobrança</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Organize clientes, tarifas, repositórios e links somente leitura.
        </p>
      </header>

      <section className="grid gap-4 py-6 sm:grid-cols-3">
        {[
          [FolderKanban, "Projetos ativos", dashboard.activeProjects],
          [Settings2, "Pendentes", dashboard.pendingProjects],
          [
            Link2,
            "Compartilhados",
            dashboard.projects.filter((project) => project.sharePath).length
          ]
        ].map(([Icon, label, value]) => {
          const MetricIcon = Icon as typeof FolderKanban;

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
        fixedView="projects"
        payments={dashboard.payments}
        projects={dashboard.projects}
        workOperations={dashboard.workOperations}
      />
    </AppShell>
  );
}
