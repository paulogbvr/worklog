"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Clock3,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  X
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import {
  calculateAge,
  formatPhone,
  formatTaxId,
  getTaxIdFeedback
} from "@/lib/client-profile";
import type {
  DashboardClient,
  DashboardPayment,
  DashboardProject,
  DashboardWorkOperation
} from "@/server/dashboard/summary";

export type OperationView = "clients" | "payments" | "projects" | "records";

type ProjectDraft = {
  active: boolean;
  billDedicated: boolean;
  clientId: string;
  dedicatedHourlyRate: string;
  hourlyRate: string;
  id: string;
  name: string;
  notes: string;
};

type ClientDraft = {
  address: string;
  birthDate: string;
  email: string;
  id?: string;
  name: string;
  notes: string;
  phone: string;
  taxId: string;
};

type WorkIntervalDraft = {
  endedAt: string;
  key: string;
  startedAt: string;
};

type WorkOperationDraft = {
  id?: string;
  intervals: WorkIntervalDraft[];
  note: string;
  projectId: string;
};

type OperationConfirmation = {
  action: "delete" | "edit";
  operation: DashboardWorkOperation;
};

const emptyClient: ClientDraft = {
  address: "",
  birthDate: "",
  email: "",
  name: "",
  notes: "",
  phone: "",
  taxId: ""
};

function todayInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function dateTimeInputValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function createWorkInterval(key = "initial", start?: Date): WorkIntervalDraft {
  const startedAt = start ? new Date(start) : new Date();
  startedAt.setSeconds(0, 0);
  const endedAt = new Date(startedAt.getTime() + 60 * 60 * 1000);

  return {
    endedAt: dateTimeInputValue(endedAt),
    key,
    startedAt: dateTimeInputValue(startedAt)
  };
}

function createWorkOperationDraft(): WorkOperationDraft {
  return {
    intervals: [createWorkInterval()],
    note: "",
    projectId: ""
  };
}

function getIntervalDurationSeconds(startedAt: string, endedAt: string) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end.getTime() <= start.getTime()
  ) {
    return null;
  }

  return Math.round((end.getTime() - start.getTime()) / 1000);
}

function formatDraftDuration(totalSeconds: number | null) {
  if (!totalSeconds) {
    return null;
  }

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
}

async function readResponse(response: Response) {
  const payload = (await response.json()) as { error?: string; ok?: boolean };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Não foi possível concluir a ação.");
  }

  return payload;
}

function Modal({
  children,
  onClose,
  title
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[color:var(--border-strong)] bg-[var(--modal-bg)] shadow-[var(--toast-shadow)]"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
          <h3 className="font-semibold text-[color:var(--app-text-strong)]">{title}</h3>
          <button
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-md text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const fieldClass =
  "h-11 w-full rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";
const selectClass = `${fieldClass} appearance-none pr-10`;
const textareaClass =
  "min-h-24 w-full resize-y rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";

export function OperationsPanel({
  clients,
  initialView = "projects",
  payments,
  projects,
  workOperations
}: {
  clients: DashboardClient[];
  initialView?: OperationView;
  payments: DashboardPayment[];
  projects: DashboardProject[];
  workOperations: DashboardWorkOperation[];
}) {
  const [view, setView] = useState<OperationView>(initialView);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);
  const [clientDraft, setClientDraft] = useState<ClientDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentProjectId, setPaymentProjectId] = useState(projects[0]?.id ?? "");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [paymentNote, setPaymentNote] = useState("");
  const [workOperationDraft, setWorkOperationDraft] = useState<WorkOperationDraft>(
    createWorkOperationDraft
  );
  const [operationConfirmation, setOperationConfirmation] =
    useState<OperationConfirmation | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    function handleViewChange(event: Event) {
      const requestedView = (event as CustomEvent<OperationView>).detail;

      if (
        requestedView === "clients" ||
        requestedView === "payments" ||
        requestedView === "projects" ||
        requestedView === "records"
      ) {
        if (requestedView === "records") {
          setWorkOperationDraft(createWorkOperationDraft());
        }
        setView(requestedView);
      }
    }

    window.addEventListener("worklog-operation-view", handleViewChange);

    return () => {
      window.removeEventListener("worklog-operation-view", handleViewChange);
    };
  }, []);

  const configuredProjects = useMemo(
    () => projects.filter((project) => project.statusLabel === "Configurado"),
    [projects]
  );
  const clientTaxIdFeedback = useMemo(
    () => (clientDraft ? getTaxIdFeedback(clientDraft.taxId) : null),
    [clientDraft]
  );
  const clientAge = useMemo(
    () => (clientDraft?.birthDate ? calculateAge(clientDraft.birthDate) : null),
    [clientDraft]
  );
  const workOperationDuration = useMemo(() => {
    const durations = workOperationDraft.intervals.map((interval) =>
      getIntervalDurationSeconds(interval.startedAt, interval.endedAt)
    );

    if (durations.some((duration) => duration === null)) {
      return null;
    }

    return formatDraftDuration(
      durations.reduce<number>((total, duration) => total + (duration ?? 0), 0)
    );
  }, [workOperationDraft.intervals]);

  function openProject(project: DashboardProject) {
    setProjectDraft({
      active: project.active,
      billDedicated: project.billDedicated,
      clientId: project.clientId ?? "",
      dedicatedHourlyRate: project.dedicatedHourlyRate?.toString() ?? "",
      hourlyRate: project.hourlyRate?.toString() ?? "",
      id: project.id,
      name: project.name,
      notes: project.notes ?? ""
    });
  }

  function openClient(client?: DashboardClient) {
    setClientDraft(
      client
        ? {
            address: client.address ?? "",
            birthDate: client.birthDate ?? "",
            email: client.email ?? "",
            id: client.id,
            name: client.name,
            notes: client.notes ?? "",
            phone: client.phone ? formatPhone(client.phone) : "",
            taxId: client.taxId ? formatTaxId(client.taxId) : ""
          }
        : emptyClient
    );
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectDraft) {
      return;
    }

    setIsSaving(true);

    try {
      await readResponse(
        await fetch(`/api/projects/${projectDraft.id}`, {
          body: JSON.stringify(projectDraft),
          headers: {
            "Content-Type": "application/json"
          },
          method: "PATCH"
        })
      );
      setProjectDraft(null);
      toast({
        message: "Cliente, cobrança e status foram atualizados.",
        title: "Projeto salvo",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível salvar o projeto.",
        title: "Erro ao salvar",
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientDraft) {
      return;
    }

    if (clientTaxIdFeedback && !clientTaxIdFeedback.valid) {
      toast({
        message: `Revise os dígitos informados para o ${clientTaxIdFeedback.kind}.`,
        title: `${clientTaxIdFeedback.kind} inválido`,
        tone: "error"
      });
      return;
    }

    setIsSaving(true);

    try {
      await readResponse(
        await fetch(clientDraft.id ? `/api/clients/${clientDraft.id}` : "/api/clients", {
          body: JSON.stringify(clientDraft),
          headers: {
            "Content-Type": "application/json"
          },
          method: clientDraft.id ? "PATCH" : "POST"
        })
      );
      setClientDraft(null);
      toast({
        message: clientDraft.id ? "Alterações salvas." : "Cliente disponível para os projetos.",
        title: clientDraft.id ? "Cliente atualizado" : "Cliente criado",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível salvar o cliente.",
        title: "Erro ao salvar",
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteClient(client: DashboardClient) {
    if (!window.confirm(`Remover o cliente ${client.name}? Os projetos ficarão sem cliente.`)) {
      return;
    }

    try {
      await readResponse(
        await fetch(`/api/clients/${client.id}`, {
          method: "DELETE"
        })
      );
      toast({
        message: "Os projetos relacionados voltaram ao estado pendente.",
        title: "Cliente removido",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível remover o cliente.",
        title: "Erro ao remover",
        tone: "error"
      });
    }
  }

  async function savePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await readResponse(
        await fetch("/api/payments", {
          body: JSON.stringify({
            amount: paymentAmount,
            note: paymentNote,
            paidAt: paymentDate,
            projectId: paymentProjectId
          }),
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST"
        })
      );
      setPaymentAmount("");
      setPaymentNote("");
      toast({
        message: "O saldo pendente foi recalculado.",
        title: "Pagamento registrado",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível registrar o pagamento.",
        title: "Erro no pagamento",
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePayment(payment: DashboardPayment) {
    if (!window.confirm(`Remover o pagamento de ${payment.amountLabel}?`)) {
      return;
    }

    try {
      await readResponse(
        await fetch(`/api/payments/${payment.id}`, {
          method: "DELETE"
        })
      );
      toast({
        message: "O saldo do projeto foi recalculado.",
        title: "Pagamento removido",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível remover o pagamento.",
        title: "Erro ao remover",
        tone: "error"
      });
    }
  }

  function editWorkOperation(operation: DashboardWorkOperation) {
    setWorkOperationDraft({
      id: operation.id,
      intervals: operation.intervals.map((interval) => ({
        endedAt: dateTimeInputValue(new Date(interval.endedAt)),
        key: interval.id,
        startedAt: dateTimeInputValue(new Date(interval.startedAt))
      })),
      note: operation.note ?? "",
      projectId: operation.projectId
    });
    setView("records");
  }

  function resetWorkOperation() {
    setWorkOperationDraft(createWorkOperationDraft());
  }

  function addWorkInterval() {
    setWorkOperationDraft((current) => ({
      ...current,
      intervals: [
        ...current.intervals,
        createWorkInterval(
          `interval-${Date.now()}-${current.intervals.length}`,
          new Date(current.intervals.at(-1)?.endedAt ?? Date.now())
        )
      ]
    }));
  }

  function removeWorkInterval(key: string) {
    setWorkOperationDraft((current) => ({
      ...current,
      intervals: current.intervals.filter((interval) => interval.key !== key)
    }));
  }

  async function saveWorkOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workOperationDraft.projectId) {
      toast({
        message: "Escolha o projeto relacionado ao período trabalhado.",
        title: "Projeto necessário",
        tone: "error"
      });
      return;
    }

    const intervals = workOperationDraft.intervals.map((interval) => ({
      endedAt: new Date(interval.endedAt),
      startedAt: new Date(interval.startedAt)
    }));
    const invalidIntervalIndex = intervals.findIndex(
      (interval) =>
        Number.isNaN(interval.startedAt.getTime()) ||
        Number.isNaN(interval.endedAt.getTime()) ||
        interval.endedAt <= interval.startedAt
    );

    if (invalidIntervalIndex >= 0) {
      toast({
        message: `Revise o início e o término do intervalo ${invalidIntervalIndex + 1}.`,
        title: "Período inválido",
        tone: "error"
      });
      return;
    }

    setIsSaving(true);

    try {
      await readResponse(
        await fetch(
          workOperationDraft.id
            ? `/api/work-entries/${workOperationDraft.id}`
            : "/api/work-entries",
          {
            body: JSON.stringify({
              intervals: intervals.map((interval) => ({
                endedAt: interval.endedAt.toISOString(),
                startedAt: interval.startedAt.toISOString()
              })),
              note: workOperationDraft.note,
              projectId: workOperationDraft.projectId
            }),
            headers: {
              "Content-Type": "application/json"
            },
            method: workOperationDraft.id ? "PATCH" : "POST"
          }
        )
      );
      toast({
        message: "Horas dedicadas e valores financeiros foram recalculados.",
        title: workOperationDraft.id ? "Operação atualizada" : "Operação criada",
        tone: "success"
      });
      resetWorkOperation();
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível salvar o registro.",
        title: "Erro no registro",
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteWorkOperation(operation: DashboardWorkOperation) {
    try {
      await readResponse(
        await fetch(`/api/work-entries/${operation.id}`, {
          method: "DELETE"
        })
      );
      if (workOperationDraft.id === operation.id) {
        resetWorkOperation();
      }
      toast({
        message: "Horas dedicadas e valores financeiros foram recalculados.",
        title: "Registro removido",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível remover o registro.",
        title: "Erro ao remover",
        tone: "error"
      });
    }
  }

  async function confirmWorkOperationAction() {
    if (!operationConfirmation) {
      return;
    }

    const { action, operation } = operationConfirmation;
    setOperationConfirmation(null);

    if (action === "edit") {
      editWorkOperation(operation);
      return;
    }

    await deleteWorkOperation(operation);
  }

  return (
    <>
      <section
        className="mt-4 rounded-lg border border-[color:var(--border)] bg-[var(--surface)]"
        id="operacao"
      >
        <div className="flex flex-col gap-4 border-b border-[color:var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Operação</h2>
            <p className="mt-1 text-sm text-[color:var(--text-soft)]">
              Configure projetos, horas dedicadas, clientes e recebimentos.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1 sm:flex sm:w-fit">
            {(["projects", "records", "clients", "payments"] as OperationView[]).map((item) => {
              const labels: Record<OperationView, string> = {
                clients: "Clientes",
                payments: "Pagamentos",
                projects: "Projetos",
                records: "Registros"
              };

              return (
                <button
                  className={[
                    "h-9 rounded px-3 text-sm transition-colors",
                    view === item
                      ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)]"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
                  ].join(" ")}
                  key={item}
                  onClick={() => {
                    if (item === "records" && view !== "records") {
                      resetWorkOperation();
                    }

                    setView(item);
                  }}
                  type="button"
                >
                  {labels[item]}
                </button>
              );
            })}
          </div>
        </div>

        {view === "projects" ? (
          <div className="divide-y divide-[color:var(--border)] px-5">
            {projects.map((project) => (
              <div
                className="grid gap-4 py-5 xl:grid-cols-[minmax(0,1.25fr)_repeat(4,minmax(100px,.5fr))_auto] xl:items-center"
                key={project.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-[color:var(--app-text-strong)]">
                      {project.name}
                    </p>
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-xs",
                        project.statusTone === "warning"
                          ? "border-[color:var(--warning-border)] bg-[var(--warning-bg)] text-[color:var(--warning-text)]"
                          : "border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)]"
                      ].join(" ")}
                    >
                      {project.statusLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--text-soft)]">
                    {project.clientName ?? "Sem cliente"} · WakaTime:{" "}
                    {project.chargeWakaTime && project.hourlyRate
                      ? `${new Intl.NumberFormat("pt-BR", {
                          currency: "BRL",
                          style: "currency"
                        }).format(project.hourlyRate)}/h`
                      : "sem cobrança"}{" "}
                    · Dedicadas:{" "}
                    {project.chargeDedicated && project.dedicatedHourlyRate
                      ? `${new Intl.NumberFormat("pt-BR", {
                          currency: "BRL",
                          style: "currency"
                        }).format(project.dedicatedHourlyRate)}/h`
                      : "sem cobrança"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">WakaTime</p>
                  <p className="mt-1 text-sm">{project.wakatimeLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Total {project.globalWakaTimeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Dedicadas</p>
                  <p className="mt-1 text-sm">{project.dedicatedLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Total {project.globalDedicatedLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Financeiro</p>
                  <p className="mt-1 text-sm">{project.totalValueLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    Pendente {project.pendingValueLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Desde o pagamento</p>
                  <p className="mt-1 text-sm">{project.sinceLastPaymentValueLabel}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                    {project.lastPaymentLabel}
                  </p>
                </div>
                <button
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                  onClick={() => openProject(project)}
                  type="button"
                >
                  {project.statusLabel === "Pendente" ? (
                    <Settings2 className="size-4" />
                  ) : (
                    <Pencil className="size-4" />
                  )}
                  {project.statusLabel === "Pendente" ? "Configurar" : "Editar"}
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {view === "records" ? (
          <div className="p-5" id="registros">
            <form
              className="grid gap-4 border-b border-[color:var(--border)] pb-5"
              noValidate
              onSubmit={saveWorkOperation}
            >
              <label className="block max-w-md">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Projeto
                </span>
                <span className="relative block">
                  <select
                    className={selectClass}
                    onChange={(event) =>
                      setWorkOperationDraft((current) => ({
                        ...current,
                        projectId: event.target.value
                      }))
                    }
                    value={workOperationDraft.projectId}
                  >
                    <option value="">Selecione o projeto</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
                  />
                </span>
              </label>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--app-text-strong)]">
                      Intervalos
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                      Pausas ficam separadas, mas a operação é salva como uma unidade.
                    </p>
                  </div>
                  {workOperationDuration ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs text-[color:var(--app-text-strong)]">
                      <Clock3 className="size-3.5" />
                      Total {workOperationDuration}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {workOperationDraft.intervals.map((interval, index) => {
                    const intervalDuration = formatDraftDuration(
                      getIntervalDurationSeconds(interval.startedAt, interval.endedAt)
                    );

                    return (
                      <div
                        className="grid gap-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                        key={interval.key}
                      >
                        <label className="block">
                          <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                            Início {index + 1}
                          </span>
                          <input
                            className={fieldClass}
                            onChange={(event) =>
                              setWorkOperationDraft((current) => ({
                                ...current,
                                intervals: current.intervals.map((currentInterval) =>
                                  currentInterval.key === interval.key
                                    ? {
                                        ...currentInterval,
                                        startedAt: event.target.value
                                      }
                                    : currentInterval
                                )
                              }))
                            }
                            type="datetime-local"
                            value={interval.startedAt}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
                            <span>Término {index + 1}</span>
                            {intervalDuration ? (
                              <span className="text-[color:var(--app-text-strong)]">
                                {intervalDuration}
                              </span>
                            ) : null}
                          </span>
                          <input
                            className={fieldClass}
                            onChange={(event) =>
                              setWorkOperationDraft((current) => ({
                                ...current,
                                intervals: current.intervals.map((currentInterval) =>
                                  currentInterval.key === interval.key
                                    ? {
                                        ...currentInterval,
                                        endedAt: event.target.value
                                      }
                                    : currentInterval
                                )
                              }))
                            }
                            type="datetime-local"
                            value={interval.endedAt}
                          />
                        </label>
                        <button
                          aria-label={`Remover intervalo ${index + 1}`}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={workOperationDraft.intervals.length === 1}
                          onClick={() => removeWorkInterval(interval.key)}
                          type="button"
                        >
                          <Trash2 className="size-4" />
                          <span className="sm:hidden">Remover</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                  onClick={addWorkInterval}
                  type="button"
                >
                  <Plus className="size-4" />
                  Adicionar intervalo
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Observação
                  </span>
                  <input
                    className={fieldClass}
                    onChange={(event) =>
                      setWorkOperationDraft((current) => ({
                        ...current,
                        note: event.target.value
                      }))
                    }
                    placeholder="O que foi feito nesta operação?"
                    value={workOperationDraft.note}
                  />
                </label>
                <div className="flex gap-2">
                  {workOperationDraft.id ? (
                    <button
                      className="h-11 rounded-md border border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                      onClick={resetWorkOperation}
                      type="button"
                    >
                      Cancelar
                    </button>
                  ) : null}
                  <button
                    className="h-11 rounded-md bg-[var(--primary-bg)] px-4 text-sm font-medium text-[color:var(--primary-text)] hover:bg-[var(--primary-hover)] disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    {isSaving
                      ? "Salvando"
                      : workOperationDraft.id
                        ? "Atualizar operação"
                        : "Adicionar operação"}
                  </button>
                </div>
              </div>
            </form>

            <div className="divide-y divide-[color:var(--border)]">
              {workOperations.length > 0 ? (
                workOperations.map((operation) => (
                  <div
                    className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    key={operation.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[color:var(--app-text-strong)]">
                          {operation.projectName}
                        </p>
                        <span className="rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-xs text-[color:var(--text-muted)]">
                          {operation.durationLabel}
                        </span>
                        <span className="text-xs text-[color:var(--text-faint)]">
                          {operation.intervals.length}{" "}
                          {operation.intervals.length === 1 ? "intervalo" : "intervalos"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-soft)]">
                        {operation.intervals.map((interval) => (
                          <span key={interval.id}>{interval.periodLabel}</span>
                        ))}
                      </div>
                      {operation.note ? (
                        <p className="mt-2 truncate text-sm text-[color:var(--text-muted)]">
                          {operation.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <button
                        aria-label={`Editar operação de ${operation.projectName}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                        onClick={() =>
                          setOperationConfirmation({ action: "edit", operation })
                        }
                        type="button"
                      >
                        <Pencil className="size-4" />
                        Editar
                      </button>
                      <button
                        aria-label={`Remover operação de ${operation.projectName}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                        onClick={() =>
                          setOperationConfirmation({ action: "delete", operation })
                        }
                        type="button"
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-[color:var(--text-soft)]">
                  Nenhum registro de trabalho adicionado.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {view === "clients" ? (
          <div id="clientes">
            <div className="flex justify-end px-5 pt-5">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary-bg)] px-3 text-sm font-medium text-[color:var(--primary-text)] hover:bg-[var(--primary-hover)]"
                onClick={() => openClient()}
                type="button"
              >
                <Plus className="size-4" />
                Novo cliente
              </button>
            </div>
            <div className="divide-y divide-[color:var(--border)] px-5">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <div
                    className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                    key={client.id}
                  >
                    <div>
                      <p className="font-medium text-[color:var(--app-text-strong)]">
                        {client.name}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                        {client.projectCount} projetos
                        {client.email ? ` · ${client.email}` : ""}
                        {client.taxId ? ` · ${formatTaxId(client.taxId)}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        aria-label={`Editar ${client.name}`}
                        className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                        onClick={() => openClient(client)}
                        type="button"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        aria-label={`Remover ${client.name}`}
                        className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => deleteClient(client)}
                        type="button"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-[color:var(--text-soft)]">
                  Nenhum cliente cadastrado.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {view === "payments" ? (
          <div className="p-5" id="pagamentos">
            <form
              className="grid gap-3 border-b border-[color:var(--border)] pb-5 md:grid-cols-[1fr_160px_160px_1fr_auto]"
              onSubmit={savePayment}
            >
              <span className="relative block">
                <select
                  className={selectClass}
                  onChange={(event) => setPaymentProjectId(event.target.value)}
                  required
                  value={paymentProjectId}
                >
                  <option value="">Selecione o projeto</option>
                  {(configuredProjects.length > 0 ? configuredProjects : projects).map(
                    (project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
                />
              </span>
              <input
                className={fieldClass}
                inputMode="decimal"
                min="0.01"
                onChange={(event) => setPaymentAmount(event.target.value)}
                placeholder="Valor"
                required
                step="0.01"
                type="number"
                value={paymentAmount}
              />
              <input
                className={fieldClass}
                onChange={(event) => setPaymentDate(event.target.value)}
                required
                type="date"
                value={paymentDate}
              />
              <input
                className={fieldClass}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder="Observação opcional"
                value={paymentNote}
              />
              <button
                className="h-11 rounded-md bg-[var(--primary-bg)] px-4 text-sm font-medium text-[color:var(--primary-text)] hover:bg-[var(--primary-hover)] disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                Registrar
              </button>
            </form>

            <div className="divide-y divide-[color:var(--border)]">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div
                    className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                    key={payment.id}
                  >
                    <div>
                      <p className="font-medium text-[color:var(--app-text-strong)]">
                        {payment.projectName}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                        {payment.note ?? "Sem observação"}
                      </p>
                    </div>
                    <span className="text-[color:var(--text-muted)]">{payment.paidAtLabel}</span>
                    <strong>{payment.amountLabel}</strong>
                    <button
                      aria-label={`Remover pagamento de ${payment.amountLabel}`}
                      className="grid size-9 place-items-center rounded-md text-[color:var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => deletePayment(payment)}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-[color:var(--text-soft)]">
                  Nenhum pagamento registrado.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {projectDraft ? (
        <Modal
          onClose={() => setProjectDraft(null)}
          title={projectDraft.clientId ? "Editar projeto" : "Configurar projeto"}
        >
          <form className="space-y-4 p-5" noValidate onSubmit={saveProject}>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                Nome exibido
              </span>
              <input
                className={fieldClass}
                onChange={(event) =>
                  setProjectDraft((current) =>
                    current ? { ...current, name: event.target.value } : current
                  )
                }
                required
                value={projectDraft.name}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Cliente
                </span>
                <span className="relative block">
                  <select
                    className={selectClass}
                    onChange={(event) =>
                      setProjectDraft((current) =>
                        current ? { ...current, clientId: event.target.value } : current
                      )
                    }
                    value={projectDraft.clientId}
                  >
                    <option value="">Nenhum cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Valor/hora WakaTime
                </span>
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  onChange={(event) =>
                    setProjectDraft((current) =>
                      current ? { ...current, hourlyRate: event.target.value } : current
                    )
                  }
                  placeholder="Ex.: 150,00"
                  type="text"
                  value={projectDraft.hourlyRate}
                />
                <span className="mt-2 block text-xs text-[color:var(--text-faint)]">
                  Vazio ou 0 mantém as horas visíveis sem gerar cobrança.
                </span>
              </label>
            </div>
            <div className="rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <button
                aria-checked={projectDraft.billDedicated}
                className="flex w-full items-center justify-between gap-4 text-left"
                onClick={() =>
                  setProjectDraft((current) =>
                    current
                      ? { ...current, billDedicated: !current.billDedicated }
                      : current
                  )
                }
                role="switch"
                type="button"
              >
                <span>
                  <span className="block text-sm font-medium text-[color:var(--app-text-strong)]">
                    Cobrar horas dedicadas
                  </span>
                  <span className="mt-1 block text-xs text-[color:var(--text-soft)]">
                    Reuniões, pesquisa e outras operações manuais entram no valor.
                  </span>
                </span>
                <span
                  aria-hidden
                  className={[
                    "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                    projectDraft.billDedicated
                      ? "border-emerald-500/40 bg-emerald-500/25"
                      : "border-[color:var(--border-strong)] bg-[var(--input-bg)]"
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-[var(--app-text-strong)] transition-[left]",
                      projectDraft.billDedicated ? "left-6" : "left-1"
                    ].join(" ")}
                  />
                </span>
              </button>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Valor/hora dedicada
                </span>
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  onChange={(event) =>
                    setProjectDraft((current) =>
                      current
                        ? { ...current, dedicatedHourlyRate: event.target.value }
                        : current
                    )
                  }
                  placeholder="Ex.: 75,00"
                  type="text"
                  value={projectDraft.dedicatedHourlyRate}
                />
                <span className="mt-2 block text-xs text-[color:var(--text-faint)]">
                  A tarifa fica salva, mas só é cobrada quando o controle acima está ativo.
                </span>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                Observações
              </span>
              <textarea
                className={textareaClass}
                onChange={(event) =>
                  setProjectDraft((current) =>
                    current ? { ...current, notes: event.target.value } : current
                  )
                }
                placeholder="Contexto importante sobre cobrança ou escopo."
                value={projectDraft.notes}
              />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={projectDraft.active}
                className="size-4 accent-emerald-500"
                onChange={(event) =>
                  setProjectDraft((current) =>
                    current ? { ...current, active: event.target.checked } : current
                  )
                }
                type="checkbox"
              />
              Projeto ativo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="h-10 rounded-md border border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)]"
                onClick={() => setProjectDraft(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-md bg-[var(--primary-bg)] px-4 text-sm font-medium text-[color:var(--primary-text)] disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Salvando" : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {operationConfirmation ? (
        <Modal
          onClose={() => setOperationConfirmation(null)}
          title={
            operationConfirmation.action === "edit"
              ? "Confirmar edição"
              : "Confirmar exclusão"
          }
        >
          <div className="p-5">
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              {operationConfirmation.action === "edit"
                ? "Deseja realmente editar esta operação?"
                : "Deseja realmente excluir esta operação?"}
            </p>
            <p className="mt-2 text-xs text-[color:var(--text-soft)]">
              {operationConfirmation.operation.projectName} ·{" "}
              {operationConfirmation.operation.durationLabel}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-10 rounded-md border border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                onClick={() => setOperationConfirmation(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className={[
                  "h-10 rounded-md px-4 text-sm font-medium transition-colors",
                  operationConfirmation.action === "delete"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[var(--primary-bg)] text-[color:var(--primary-text)] hover:bg-[var(--primary-hover)]"
                ].join(" ")}
                onClick={confirmWorkOperationAction}
                type="button"
              >
                {operationConfirmation.action === "edit"
                  ? "Editar operação"
                  : "Excluir operação"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {clientDraft ? (
        <Modal
          onClose={() => setClientDraft(null)}
          title={clientDraft.id ? "Editar cliente" : "Novo cliente"}
        >
          <form className="space-y-5 p-5" onSubmit={saveClient}>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">Nome</span>
              <input
                className={fieldClass}
                onChange={(event) =>
                  setClientDraft((current) =>
                    current ? { ...current, name: event.target.value } : current
                  )
                }
                required
                value={clientDraft.name}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Email
                </span>
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setClientDraft((current) =>
                      current ? { ...current, email: event.target.value } : current
                    )
                  }
                  type="email"
                  value={clientDraft.email}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Telefone
                </span>
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setClientDraft((current) =>
                      current ? { ...current, phone: formatPhone(event.target.value) } : current
                    )
                  }
                  inputMode="tel"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  value={clientDraft.phone}
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  CPF/CNPJ
                </span>
                <input
                  aria-describedby={clientTaxIdFeedback ? "tax-id-feedback" : undefined}
                  className={[
                    fieldClass,
                    clientTaxIdFeedback
                      ? clientTaxIdFeedback.valid
                        ? "border-emerald-500/55 focus:border-emerald-500/75"
                        : "border-red-500/55 focus:border-red-500/75"
                      : ""
                  ].join(" ")}
                  inputMode="numeric"
                  maxLength={18}
                  onChange={(event) =>
                    setClientDraft((current) =>
                      current ? { ...current, taxId: formatTaxId(event.target.value) } : current
                    )
                  }
                  placeholder="000.000.000-00"
                  value={clientDraft.taxId}
                />
                {clientTaxIdFeedback ? (
                  <span
                    className={[
                      "mt-2 flex items-center gap-2 text-xs font-medium",
                      clientTaxIdFeedback.valid ? "text-emerald-500" : "text-red-400"
                    ].join(" ")}
                    id="tax-id-feedback"
                  >
                    <span
                      aria-hidden
                      className={[
                        "size-1.5 rounded-full",
                        clientTaxIdFeedback.valid ? "bg-emerald-500" : "bg-red-500"
                      ].join(" ")}
                    />
                    {clientTaxIdFeedback.kind}{" "}
                    {clientTaxIdFeedback.valid ? "válido" : "inválido"}
                  </span>
                ) : (
                  <span className="mt-2 block text-xs text-[color:var(--text-faint)]">
                    A máscara muda automaticamente entre CPF e CNPJ.
                  </span>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
                  <span>Data de nascimento</span>
                  {clientAge !== null ? (
                    <span className="rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-[color:var(--app-text-strong)]">
                      {clientAge} {clientAge === 1 ? "ano" : "anos"}
                    </span>
                  ) : null}
                </span>
                <input
                  className={fieldClass}
                  max={todayInputValue()}
                  onChange={(event) =>
                    setClientDraft((current) =>
                      current ? { ...current, birthDate: event.target.value } : current
                    )
                  }
                  type="date"
                  value={clientDraft.birthDate}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                Endereço
              </span>
              <textarea
                className="min-h-20 w-full resize-y rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]"
                onChange={(event) =>
                  setClientDraft((current) =>
                    current ? { ...current, address: event.target.value } : current
                  )
                }
                placeholder="Rua, número, complemento, cidade e estado."
                value={clientDraft.address}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                Observações
              </span>
              <textarea
                className={textareaClass}
                onChange={(event) =>
                  setClientDraft((current) =>
                    current ? { ...current, notes: event.target.value } : current
                  )
                }
                value={clientDraft.notes}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                className="h-10 rounded-md border border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)]"
                onClick={() => setClientDraft(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-md bg-[var(--primary-bg)] px-4 text-sm font-medium text-[color:var(--primary-text)] disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Salvando" : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
