"use client";

import { useState } from "react";
import { Copy, Eye, X } from "lucide-react";
import { StatusPulse } from "@/components/status-pulse";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast-provider";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import type { DashboardPeriod, DashboardProject } from "@/server/dashboard/summary";

type OperationData = {
  activeProjects: number;
  pendingProjects: number;
  periodDedicatedLabel: string;
  periodWakaTimeLabel: string;
  projects: DashboardProject[];
};

const PERIOD_LABELS: Array<[DashboardPeriod, string]> = [
  ["7d", "7D"],
  ["30d", "30D"],
  ["all", "ALL"]
];

function periodContextFor(period: DashboardPeriod) {
  if (period === "all") {
    return "em todo o histórico";
  }

  return period === "30d" ? "nos últimos 30 dias" : "nos últimos 7 dias";
}

function buildProjectText(project: DashboardProject) {
  const lines = [
    `Projeto → ${project.name}`,
    `Cliente → ${project.clientName ?? "Sem cliente"}`,
    `Status → ${project.projectStatusLabel}`,
    `WakaTime → ${project.wakatimeLabel}`,
    `Horas dedicadas → ${project.dedicatedLabel}`,
    `${project.billingMode === "FIXED" ? "Preço fechado" : "Valor gerado"} → ${project.totalValueLabel}`,
    `Valor recebido → ${project.receivedValueLabel}`,
    `${project.pendingIsCredit ? "Excedente" : "Valor pendente"} → ${project.pendingValueLabel}`
  ];

  return lines.join("\n\n");
}

export function OperationCurrent({
  initial,
  projectId
}: {
  initial: OperationData & { period: DashboardPeriod };
  projectId: string | null;
}) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardPeriod>(initial.period);
  const [data, setData] = useState<OperationData>(initial);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<DashboardProject | null>(null);
  const periodContext = periodContextFor(period);

  async function selectPeriod(next: DashboardPeriod) {
    if (next === period) {
      return;
    }

    setPeriod(next);
    setLoading(true);

    try {
      const query = new URLSearchParams({ period: next });

      if (projectId) {
        query.set("project", projectId);
      }

      const response = await fetch(`/api/dashboard/operation?${query.toString()}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as { ok?: boolean } & OperationData;

      if (response.ok && payload.ok) {
        setData({
          activeProjects: payload.activeProjects,
          pendingProjects: payload.pendingProjects,
          periodDedicatedLabel: payload.periodDedicatedLabel,
          periodWakaTimeLabel: payload.periodWakaTimeLabel,
          projects: payload.projects
        });
      }
    } catch {
      toast({
        message: "Não foi possível atualizar a operação atual.",
        title: "Erro ao filtrar",
        tone: "error"
      });
    } finally {
      setLoading(false);
    }
  }

  async function copyProject(project: DashboardProject) {
    try {
      await copyTextToClipboard(buildProjectText(project));
      toast({
        message: "Os dados do projeto estão na área de transferência.",
        title: "Dados copiados",
        tone: "success"
      });
    } catch {
      toast({
        message: "Não foi possível copiar os dados.",
        title: "Erro ao copiar",
        tone: "error"
      });
    }
  }

  return (
    <section
      className="mt-8 rounded-lg border border-[color:var(--border)] bg-[var(--surface)]"
      id="operacao-atual"
    >
      <div className="flex flex-col gap-4 border-b border-[color:var(--border)] p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Operação atual</h2>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">
            Posição {periodContext} por projeto ativo.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav
            aria-label="Filtrar operação atual por período"
            className="grid grid-cols-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1"
          >
            {PERIOD_LABELS.map(([value, label]) => (
              <button
                aria-current={period === value ? "page" : undefined}
                className={[
                  "min-w-12 rounded px-3 py-1.5 text-center text-xs font-medium transition-all duration-200 ease-out active:scale-95",
                  period === value
                    ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
                ].join(" ")}
                key={value}
                onClick={() => void selectPeriod(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="grid grid-cols-4 gap-4 text-center sm:gap-7">
            {[
              ["Ativos", data.activeProjects],
              ["Pendentes", data.pendingProjects],
              ["WakaTime", data.periodWakaTimeLabel],
              ["Dedicadas", data.periodDedicatedLabel]
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-base font-semibold sm:text-lg">{value}</p>
                <p className="text-[10px] uppercase text-[color:var(--text-faint)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-[color:var(--border)] px-5">
        {loading ? (
          <div className="space-y-3 py-5">
            {["o1", "o2", "o3"].map((key) => (
              <Skeleton className="h-16 w-full" key={key} />
            ))}
          </div>
        ) : data.projects.length > 0 ? (
          data.projects.map((project) => (
            <article
              className="grid gap-4 py-5 md:grid-cols-[minmax(0,1.1fr)_repeat(4,minmax(96px,.55fr))_auto] md:items-center"
              key={project.id}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-[color:var(--app-text-strong)]">
                    {project.name}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] ${project.projectStatusBadgeClass}`}
                  >
                    <StatusPulse tone={project.projectStatusTone} />
                    {project.projectStatusLabel}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-[color:var(--text-soft)]">
                  {project.clientName ?? "Sem cliente"} · último pagamento:{" "}
                  {project.lastPaymentLabel}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4 md:contents md:gap-0 md:rounded-none md:border-0 md:bg-transparent md:p-0">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                    WakaTime
                  </p>
                  <p className="mt-1 text-sm">{project.wakatimeLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                    Dedicadas
                  </p>
                  <p className="mt-1 text-sm">{project.dedicatedLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                    {project.billingMode === "FIXED" ? "Preço fechado" : "Gerado"}
                  </p>
                  <p className="mt-1 text-sm">{project.totalValueLabel}</p>
                  <p
                    className={[
                      "mt-1 text-xs",
                      project.pendingIsCredit ? "text-emerald-400" : "text-[color:var(--text-soft)]"
                    ].join(" ")}
                  >
                    {project.pendingIsCredit ? "Excedente" : "Pendente"} {project.pendingValueLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)] md:text-xs md:normal-case md:tracking-normal">
                    Recebido
                  </p>
                  <p className="mt-1 text-sm">{project.receivedValueLabel}</p>
                </div>
              </div>
              <button
                aria-label={`Visualizar ${project.name}`}
                className="grid size-9 shrink-0 place-items-center justify-self-end rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                onClick={() => setPreview(project)}
                title="Visualização rápida"
                type="button"
              >
                <Eye className="size-4" />
              </button>
            </article>
          ))
        ) : (
          <p className="py-8 text-sm text-[color:var(--text-soft)]">
            Nenhum projeto encontrado para o filtro atual.
          </p>
        )}
      </div>

      {preview ? (
        <OperationPreview
          onClose={() => setPreview(null)}
          onCopy={() => void copyProject(preview)}
          project={preview}
        />
      ) : null}
    </section>
  );
}

function OperationPreview({
  onClose,
  onCopy,
  project
}: {
  onClose: () => void;
  onCopy: () => void;
  project: DashboardProject;
}) {
  useLockBodyScroll();

  const rows: Array<[string, string]> = [
    ["Cliente", project.clientName ?? "Sem cliente"],
    ["Status", project.projectStatusLabel],
    ["Tipo de cobrança", project.billingMode === "FIXED" ? "Preço fechado" : "Por horas"],
    ["WakaTime", project.wakatimeLabel],
    ["Horas dedicadas", project.dedicatedLabel],
    [project.billingMode === "FIXED" ? "Preço fechado" : "Valor gerado", project.totalValueLabel],
    ["Valor recebido", project.receivedValueLabel],
    [project.pendingIsCredit ? "Excedente" : "Valor pendente", project.pendingValueLabel]
  ];

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[color:var(--border-strong)] bg-[var(--modal-bg)] shadow-[var(--toast-shadow)]"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
          <h3 className="truncate font-semibold text-[color:var(--app-text-strong)]">
            {project.name}
          </h3>
          <button
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-md text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)]">
                  {label}
                </dt>
                <dd className="mt-0.5 break-words text-sm text-[color:var(--app-text-strong)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex justify-end border-t border-[color:var(--border)] pt-4">
            <button
              className="button-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition-transform duration-200 active:scale-[0.97]"
              onClick={onCopy}
              type="button"
            >
              <Copy className="size-4" />
              Copiar dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
