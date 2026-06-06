import { AppShell } from "@/components/app-shell";
import { OperationsPanel } from "@/components/operations-panel";
import { getServerEnvStatus } from "@/lib/env";
import { getDashboardSummary } from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const dashboard = await getDashboardSummary("all");

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Operações</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Tempo dedicado</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Registre trabalho fora do editor em um ou mais intervalos.
        </p>
      </header>

      <div className="pt-6">
        <OperationsPanel
          clients={dashboard.clients}
          fixedView="records"
          payments={dashboard.payments}
          projects={dashboard.projects}
          workOperations={dashboard.workOperations}
        />
      </div>
    </AppShell>
  );
}
