import { Clock3, Code2, WalletCards } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardData } from "@/components/dashboard-data";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { OperationCurrent } from "@/components/operation-current";
import {
  getDashboardSummary,
  type DashboardPeriod
} from "@/server/dashboard/summary";

function periodContextFor(period: DashboardPeriod) {
  if (period === "all") {
    return "em todo o histórico";
  }

  return period === "30d" ? "nos últimos 30 dias" : "nos últimos 7 dias";
}

export async function DashboardSections({
  period,
  projectId
}: {
  period: DashboardPeriod;
  projectId: string | null;
}) {
  const dashboard = await getDashboardSummary(period, projectId);
  const periodContext = periodContextFor(dashboard.period);

  return (
    <DashboardData skeleton={<DashboardSkeleton />}>
      <section className="py-7">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            {dashboard.period === "all" ? "Resumo histórico" : "Resumo do período"}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              hint: dashboard.periodWakaTimeDaysLabel,
              icon: Code2,
              label: `WakaTime ${periodContext}`,
              tone: "bg-blue-500/10 text-blue-400",
              value: dashboard.periodWakaTimeLabel
            },
            {
              hint: dashboard.periodDedicatedDaysLabel,
              icon: Clock3,
              label: `Horas dedicadas ${periodContext}`,
              tone: "bg-amber-500/10 text-amber-500",
              value: dashboard.periodDedicatedLabel
            },
            {
              hint: null,
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
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-2 truncate text-xl font-semibold">
                    {item.value}
                    {item.hint ? (
                      <span className="text-[11px] font-medium text-[color:var(--text-faint)]">
                        {item.hint}
                      </span>
                    ) : null}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <DashboardCharts data={dashboard.chartData} series={dashboard.chartSeries} />

      <OperationCurrent
        initial={{
          activeProjects: dashboard.activeProjects,
          pendingProjects: dashboard.pendingProjects,
          period: dashboard.period,
          periodDedicatedLabel: dashboard.periodDedicatedLabel,
          periodWakaTimeLabel: dashboard.periodWakaTimeLabel,
          projects: dashboard.projects
        }}
        projectId={projectId}
      />
    </DashboardData>
  );
}
