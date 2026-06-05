"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DashboardChartPoint } from "@/server/dashboard/summary";

const tooltipStyle = {
  background: "var(--modal-bg)",
  border: "1px solid var(--border-strong)",
  borderRadius: "8px",
  boxShadow: "var(--card-shadow)",
  color: "var(--app-text-strong)",
  fontSize: "12px"
};

export function DashboardCharts({ data }: { data: DashboardChartPoint[] }) {
  return (
    <section className="mt-8 grid gap-4 xl:grid-cols-2" aria-label="Evolução do período">
      <article className="min-w-0 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-base font-semibold">Evolução das horas</h2>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Código registrado e tempo dedicado.
          </p>
        </div>
        <div className="mt-5 h-[260px] min-w-0">
          <ResponsiveContainer
            height="100%"
            initialDimension={{ height: 260, width: 620 }}
            minWidth={0}
            width="100%"
          >
            <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
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
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  `${Number(value).toLocaleString("pt-BR", {
                    maximumFractionDigits: 2
                  })}h`,
                  name
                ]}
                labelStyle={{ color: "var(--text-muted)", marginBottom: "6px" }}
              />
              <Area
                dataKey="wakatimeHours"
                fill="var(--chart-wakatime-fill)"
                name="WakaTime"
                stroke="var(--chart-wakatime)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="dedicatedHours"
                fill="var(--chart-dedicated-fill)"
                name="Dedicadas"
                stroke="var(--chart-dedicated)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="min-w-0 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h2 className="text-base font-semibold">Movimento financeiro</h2>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Valor gerado e pagamentos registrados.
          </p>
        </div>
        <div className="mt-5 h-[260px] min-w-0">
          <ResponsiveContainer
            height="100%"
            initialDimension={{ height: 260, width: 620 }}
            minWidth={0}
            width="100%"
          >
            <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
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
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  new Intl.NumberFormat("pt-BR", {
                    currency: "BRL",
                    style: "currency"
                  }).format(Number(value)),
                  name
                ]}
                labelStyle={{ color: "var(--text-muted)", marginBottom: "6px" }}
              />
              <Area
                dataKey="generatedValue"
                fill="var(--chart-generated-fill)"
                name="Gerado"
                stroke="var(--chart-generated)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="receivedValue"
                fill="var(--chart-received-fill)"
                name="Recebido"
                stroke="var(--chart-received)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
