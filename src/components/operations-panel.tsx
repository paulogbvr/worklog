"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
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
  DashboardProject
} from "@/server/dashboard/summary";

type View = "clients" | "payments" | "projects";

type ProjectDraft = {
  active: boolean;
  clientId: string;
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

async function readResponse(response: Response) {
  const payload = (await response.json()) as { error?: string; ok?: boolean };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "Não foi possível concluir a ação.");
  }

  return payload;
}

function parseHourlyRate(value: string) {
  return Number(value.replace(",", "."));
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
const textareaClass =
  "min-h-24 w-full resize-y rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";

export function OperationsPanel({
  clients,
  payments,
  projects
}: {
  clients: DashboardClient[];
  payments: DashboardPayment[];
  projects: DashboardProject[];
}) {
  const [view, setView] = useState<View>("projects");
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);
  const [clientDraft, setClientDraft] = useState<ClientDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentProjectId, setPaymentProjectId] = useState(projects[0]?.id ?? "");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [paymentNote, setPaymentNote] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    function handleViewChange(event: Event) {
      const requestedView = (event as CustomEvent<View>).detail;

      if (requestedView === "clients" || requestedView === "payments" || requestedView === "projects") {
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

  function openProject(project: DashboardProject) {
    setProjectDraft({
      active: project.active,
      clientId: project.clientId ?? "",
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

    if (!projectDraft.clientId) {
      toast({
        message: "Selecione o cliente responsável pelo projeto.",
        title: "Cliente obrigatório",
        tone: "error"
      });
      return;
    }

    const hourlyRate = parseHourlyRate(projectDraft.hourlyRate);

    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      toast({
        message: "Informe um valor por hora maior que zero.",
        title: "Valor por hora inválido",
        tone: "error"
      });
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
        message: "Cliente, valor por hora e status foram atualizados.",
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
              Configure projetos, clientes e recebimentos.
            </p>
          </div>
          <div className="inline-flex w-fit rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1">
            {(["projects", "clients", "payments"] as View[]).map((item) => {
              const labels: Record<View, string> = {
                clients: "Clientes",
                payments: "Pagamentos",
                projects: "Projetos"
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
                  onClick={() => setView(item)}
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
                className="grid gap-4 py-5 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(110px,.5fr))_auto] md:items-center"
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
                  <p className="mt-1 truncate text-xs text-[color:var(--text-soft)]">
                    {project.clientName ?? "Sem cliente"} ·{" "}
                    {project.hourlyRate
                      ? `${new Intl.NumberFormat("pt-BR", {
                          currency: "BRL",
                          style: "currency"
                        }).format(project.hourlyRate)}/h`
                      : "Valor/hora pendente"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Horas base</p>
                  <p className="mt-1 text-sm">
                    {project.billingSource === "manual"
                      ? project.dedicatedLabel
                      : project.wakatimeLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Gerado</p>
                  <p className="mt-1 text-sm">{project.totalValueLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-[color:var(--text-faint)]">Pendente</p>
                  <p className="mt-1 text-sm">{project.pendingValueLabel}</p>
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
              <select
                className={fieldClass}
                onChange={(event) => setPaymentProjectId(event.target.value)}
                required
                value={paymentProjectId}
              >
                <option value="">Selecione o projeto</option>
                {(configuredProjects.length > 0 ? configuredProjects : projects).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
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
          <form className="space-y-4 p-5" onSubmit={saveProject}>
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
                <select
                  className={fieldClass}
                  onChange={(event) =>
                    setProjectDraft((current) =>
                      current ? { ...current, clientId: event.target.value } : current
                    )
                  }
                  required
                  value={projectDraft.clientId}
                >
                  <option value="">Selecione</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                  Valor por hora
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
                  required
                  type="text"
                  value={projectDraft.hourlyRate}
                />
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
