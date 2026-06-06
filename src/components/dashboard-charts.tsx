"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type {
  DashboardChartPoint,
  DashboardChartSeries
} from "@/server/dashboard/summary";

const tooltipStyle = {
  background: "var(--modal-bg)",
  border: "1px solid var(--border-strong)",
  borderRadius: "8px",
  boxShadow: "var(--card-shadow)",
  color: "var(--app-text-strong)"
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  mode: "finance" | "hours";
  payload?: ReadonlyArray<{
    payload?: DashboardChartPoint;
  }>;
  series: DashboardChartSeries[];
};

function numberFromPoint(point: DashboardChartPoint, key: string) {
  const value = point[key];
  return typeof value === "number" ? value : 0;
}

function ChartTooltip({
  active,
  label,
  mode,
  payload,
  series
}: ChartTooltipProps) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="min-w-56 p-3 text-xs" style={tooltipStyle}>
      <p className="font-medium text-[color:var(--app-text-strong)]">{label}</p>
      <div className="mt-3 space-y-3">
        {series.map((project) => {
          const wakatime = numberFromPoint(point, project.wakatimeKey);
          const dedicated = numberFromPoint(point, project.dedicatedKey);
          const generated = numberFromPoint(point, project.generatedKey);
          const received = numberFromPoint(point, project.receivedKey);

          if (wakatime === 0 && dedicated === 0 && generated === 0 && received === 0) {
            return null;
          }

          return (
            <div className="border-t border-[color:var(--border)] pt-2 first:border-0 first:pt-0" key={project.id}>
              <p className="flex items-center gap-2 font-medium">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </p>
              {mode === "hours" ? (
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[color:var(--text-muted)]">
                  <span>WakaTime</span>
                  <strong className="text-right font-medium text-[color:var(--app-text-strong)]">
                    {wakatime.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}h
                  </strong>
                  <span>Dedicadas</span>
                  <strong className="text-right font-medium text-[color:var(--app-text-strong)]">
                    {dedicated.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}h
                  </strong>
                  <span>Valor gerado</span>
                  <strong className="text-right font-medium text-[color:var(--app-text-strong)]">
                    {generated.toLocaleString("pt-BR", {
                      currency: "BRL",
                      style: "currency"
                    })}
                  </strong>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[color:var(--text-muted)]">
                  <span>Gerado</span>
                  <strong className="text-right font-medium text-[color:var(--app-text-strong)]">
                    {generated.toLocaleString("pt-BR", {
                      currency: "BRL",
                      style: "currency"
                    })}
                  </strong>
                  <span>Recebido</span>
                  <strong className="text-right font-medium text-[color:var(--app-text-strong)]">
                    {received.toLocaleString("pt-BR", {
                      currency: "BRL",
                      style: "currency"
                    })}
                  </strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectLegend({ series }: { series: DashboardChartSeries[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
      {series.map((project) => (
        <span
          className="inline-flex items-center gap-2 text-xs text-[color:var(--text-muted)]"
          key={project.id}
        >
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          {project.name}
        </span>
      ))}
    </div>
  );
}

export function DashboardCharts({
  data,
  series
}: {
  data: DashboardChartPoint[];
  series: DashboardChartSeries[];
}) {
  return (
    <section
      aria-label="Evolução do período"
      className="chart-interactive mt-8 grid gap-4 xl:grid-cols-2"
    >
      <article className="min-w-0 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-base font-semibold">Evolução das horas</h2>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Tempo total por projeto no período selecionado.
          </p>
          <ProjectLegend series={series} />
        </div>
        <div className="mt-5 h-[260px] min-w-0">
          <ResponsiveContainer
            height="100%"
            initialDimension={{ height: 260, width: 620 }}
            minWidth={0}
            width="100%"
          >
            <LineChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 5"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                tickFormatter={(value) => `${value}h`}
                tickLine={false}
                width={48}
              />
              <Tooltip
                content={<ChartTooltip mode="hours" series={series} />}
                cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }}
              />
              {series.map((project) => (
                <Line
                  activeDot={{ r: 4 }}
                  dataKey={project.hoursKey}
                  dot={false}
                  key={project.id}
                  name={project.name}
                  stroke={project.color}
                  strokeWidth={2}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="min-w-0 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-base font-semibold">Movimento financeiro</h2>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Linhas sólidas mostram geração; tracejadas mostram recebimentos.
          </p>
          <ProjectLegend series={series} />
        </div>
        <div className="mt-5 h-[260px] min-w-0">
          <ResponsiveContainer
            height="100%"
            initialDimension={{ height: 260, width: 620 }}
            minWidth={0}
            width="100%"
          >
            <LineChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
              <CartesianGrid
                stroke="var(--chart-grid)"
                strokeDasharray="3 5"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "var(--text-faint)", fontSize: 11 }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    compactDisplay: "short",
                    notation: "compact"
                  }).format(value)
                }
                tickLine={false}
                width={58}
              />
              <Tooltip
                content={<ChartTooltip mode="finance" series={series} />}
                cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }}
              />
              {series.flatMap((project) => [
                <Line
                  activeDot={{ r: 4 }}
                  dataKey={project.generatedKey}
                  dot={false}
                  key={`${project.id}-generated`}
                  name={`${project.name} gerado`}
                  stroke={project.color}
                  strokeWidth={2}
                  type="monotone"
                />,
                <Line
                  dataKey={project.receivedKey}
                  dot={false}
                  key={`${project.id}-received`}
                  name={`${project.name} recebido`}
                  stroke={project.color}
                  strokeDasharray="5 5"
                  strokeOpacity={0.6}
                  strokeWidth={1.5}
                  type="monotone"
                />
              ])}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
