import { CircleDollarSign, ClockArrowDown, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OperationsPanel } from "@/components/operations-panel";
import { getServerEnvStatus } from "@/lib/env";
import { formatCurrency, getDashboardSummary } from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const dashboard = await getDashboardSummary("all");
  const totalReceived = dashboard.projects.reduce(
    (total, project) => total + project.receivedValue,
    0
  );

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Pagamentos</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Recebimentos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Registre entradas e acompanhe o saldo financeiro de cada projeto.
        </p>
      </header>

      <section className="grid gap-4 py-6 sm:grid-cols-3">
        {[
          [CircleDollarSign, "Total recebido", formatCurrency(totalReceived)],
          [ClockArrowDown, "Pendente", dashboard.globalPendingValueLabel],
          [ReceiptText, "Pagamentos", dashboard.payments.length.toString()]
        ].map(([Icon, label, value]) => {
          const MetricIcon = Icon as typeof CircleDollarSign;

          return (
            <article
              className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface-soft)] p-4"
              key={label as string}
            >
              <MetricIcon className="size-5 text-[color:var(--text-muted)]" />
              <div>
                <p className="text-xs text-[color:var(--text-soft)]">{label as string}</p>
                <p className="mt-1 text-xl font-semibold">{value as string}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mb-6 border-y border-[color:var(--border)] py-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          Recebido por projeto
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.projects.map((project) => (
            <div className="flex items-center justify-between gap-4" key={project.id}>
              <span className="truncate text-sm text-[color:var(--text-muted)]">
                {project.name}
              </span>
              <strong className="text-sm">{formatCurrency(project.receivedValue)}</strong>
            </div>
          ))}
        </div>
      </section>

      <OperationsPanel
        clients={dashboard.clients}
        fixedView="payments"
        payments={dashboard.payments}
        projects={dashboard.projects}
        workOperations={dashboard.workOperations}
      />
    </AppShell>
  );
}
