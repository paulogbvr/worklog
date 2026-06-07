"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  ReceiptText,
  Share2,
  Settings2,
  Trash2,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { DateField, TimeField } from "@/components/date-fields";
import { ProjectNotesModal } from "@/components/project-notes-modal";
import { StatusPulse } from "@/components/status-pulse";
import { useToast } from "@/components/toast-provider";
import {
  calculateAge,
  formatPhone,
  formatTaxId,
  getTaxIdFeedback
} from "@/lib/client-profile";
import {
  CLIENT_STATUSES,
  type ClientStatusValue
} from "@/lib/client-status";
import {
  buildPaymentMessage,
  PAYMENT_METHODS,
  type PaymentMethodValue
} from "@/lib/payment";
import { copyTextToClipboard } from "@/lib/clipboard";
import {
  PROJECT_STATUSES,
  type ProjectStatusValue
} from "@/lib/project-status";
import { buildReminderMessage, REMINDER_AMOUNT_MODES } from "@/lib/reminder";
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
  billingMode: "FIXED" | "HOURLY";
  clientId: string;
  clientPhone: string | null;
  dedicatedHourlyRate: string;
  fixedPrice: string;
  hourlyRate: string;
  id: string;
  name: string;
  notes: string;
  pendingValue: number;
  pendingValueLabel: string;
  status: ProjectStatusValue;
  repositoryUrl: string;
  shareAccessCount: number;
  sharePath: string | null;
  reminderEnabled: boolean;
  reminderAmountMode: "FIXED" | "PENDING";
  reminderFixedAmount: string;
  reminderDueDate: string;
  reminderMessage: string;
};

type ClientDraft = {
  address: string;
  birthDate: string;
  email: string;
  id?: string;
  name: string;
  notes: string;
  phone: string;
  status: ClientStatusValue | "";
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

type PaymentConfirmation = {
  payment: DashboardPayment;
};

const emptyClient: ClientDraft = {
  address: "",
  birthDate: "",
  email: "",
  name: "",
  notes: "",
  phone: "",
  status: "",
  taxId: ""
};

function todayInputValue() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return null;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function dateTimeInputValue(date = new Date()) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

// Intervals keep the combined "YYYY-MM-DDTHH:mm" format internally so that the
// duration math, save and edit flows stay unchanged. The UI splits/joins it
// into separate date + time inputs to avoid the native datetime-local width
// issues on mobile.
function splitDateTimeValue(value: string) {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

function joinDateTimeValue(date: string, time: string) {
  if (!date && !time) {
    return "";
  }

  return `${date}T${time || "00:00"}`;
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
  const payload = (await response.json()) as {
    error?: string;
    ok?: boolean;
    path?: string;
  };

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
            className="grid size-8 place-items-center rounded-md text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
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
  "h-11 w-full min-w-0 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";
const selectClass = `${fieldClass} appearance-none pr-10`;
const textareaClass =
  "min-h-24 w-full resize-y rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]";

export function OperationsPanel({
  clients,
  fixedView,
  initialView = "projects",
  payments,
  projects,
  workOperations
}: {
  clients: DashboardClient[];
  fixedView?: OperationView;
  initialView?: OperationView;
  payments: DashboardPayment[];
  projects: DashboardProject[];
  workOperations: DashboardWorkOperation[];
}) {
  const [viewState, setView] = useState<OperationView>(initialView);
  const view = fixedView ?? viewState;
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);
  const [clientDraft, setClientDraft] = useState<ClientDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentProjectId, setPaymentProjectId] = useState(projects[0]?.id ?? "");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [paymentEditingId, setPaymentEditingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("PIX");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentReceiptInputKey, setPaymentReceiptInputKey] = useState(0);
  const [removePaymentReceipt, setRemovePaymentReceipt] = useState(false);
  const [paymentInvoiceKey, setPaymentInvoiceKey] = useState("");
  const [paymentInvoice, setPaymentInvoice] = useState<File | null>(null);
  const [paymentInvoiceInputKey, setPaymentInvoiceInputKey] = useState(0);
  const [removePaymentInvoice, setRemovePaymentInvoice] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] =
    useState<PaymentConfirmation | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<DashboardPayment | null>(null);
  const [receiptZoom, setReceiptZoom] = useState(100);
  const [invoicePreview, setInvoicePreview] = useState<DashboardPayment | null>(null);
  const [invoiceZoom, setInvoiceZoom] = useState(100);
  const [workOperationDraft, setWorkOperationDraft] = useState<WorkOperationDraft>(
    createWorkOperationDraft
  );
  const [operationConfirmation, setOperationConfirmation] =
    useState<OperationConfirmation | null>(null);
  const [recordComposerOpen, setRecordComposerOpen] = useState(fixedView !== "records");
  const [notesProject, setNotesProject] = useState<{ id: string; name: string } | null>(
    null
  );
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
      billingMode: project.billingMode,
      clientId: project.clientId ?? "",
      clientPhone: project.clientPhone,
      dedicatedHourlyRate: project.dedicatedHourlyRate?.toString() ?? "",
      fixedPrice: project.fixedPrice?.toString() ?? "",
      hourlyRate: project.hourlyRate?.toString() ?? "",
      id: project.id,
      name: project.name,
      notes: project.notes ?? "",
      pendingValue: project.pendingIsCredit ? 0 : project.pendingValue,
      pendingValueLabel: project.pendingValueLabel,
      status: project.projectStatus,
      repositoryUrl: project.repositoryUrl ?? "",
      shareAccessCount: project.shareAccessCount,
      sharePath: project.sharePath,
      reminderEnabled: project.reminderEnabled,
      reminderAmountMode: project.reminderAmountMode,
      reminderFixedAmount: project.reminderFixedAmount?.toString() ?? "",
      reminderDueDate: project.reminderDueDate ?? "",
      reminderMessage: project.reminderMessage ?? ""
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
            status: client.status ?? "",
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

    if (projectDraft.reminderEnabled && !projectDraft.reminderDueDate) {
      toast({
        message: "Informe a data do lembrete de pagamento.",
        title: "Lembrete incompleto",
        tone: "error"
      });
      return;
    }

    if (
      projectDraft.reminderEnabled &&
      projectDraft.reminderAmountMode === "FIXED" &&
      !(Number(projectDraft.reminderFixedAmount.replace(",", ".")) > 0)
    ) {
      toast({
        message: "Informe um valor fixo maior que zero para o lembrete.",
        title: "Lembrete incompleto",
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

      if (projectDraft.reminderEnabled) {
        await readResponse(
          await fetch(`/api/projects/${projectDraft.id}/reminder`, {
            body: JSON.stringify({
              amountMode: projectDraft.reminderAmountMode,
              dueDate: projectDraft.reminderDueDate,
              fixedAmount: projectDraft.reminderFixedAmount,
              message: projectDraft.reminderMessage
            }),
            headers: {
              "Content-Type": "application/json"
            },
            method: "PUT"
          })
        );
      } else {
        await fetch(`/api/projects/${projectDraft.id}/reminder`, {
          method: "DELETE"
        });
      }

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

    if (!paymentProjectId) {
      toast({
        message: "Escolha o projeto que recebeu o pagamento.",
        title: "Projeto necessário",
        tone: "error"
      });
      return;
    }

    if (!Number.isFinite(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      toast({
        message: "Informe um valor maior que zero.",
        title: "Valor inválido",
        tone: "error"
      });
      return;
    }

    if (!paymentDate) {
      toast({
        message: "Informe a data em que o pagamento foi recebido.",
        title: "Data necessária",
        tone: "error"
      });
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.set("amount", paymentAmount);
      formData.set("method", paymentMethod);
      formData.set("note", paymentNote);
      formData.set("paidAt", paymentDate);
      formData.set("projectId", paymentProjectId);
      formData.set("removeReceipt", removePaymentReceipt ? "true" : "false");
      formData.set("invoiceKey", paymentInvoiceKey);
      formData.set("removeInvoice", removePaymentInvoice ? "true" : "false");

      if (paymentReceipt) {
        formData.set("receipt", paymentReceipt);
      }

      if (paymentInvoice) {
        formData.set("invoice", paymentInvoice);
      }

      await readResponse(
        await fetch(paymentEditingId ? `/api/payments/${paymentEditingId}` : "/api/payments", {
          body: formData,
          method: paymentEditingId ? "PATCH" : "POST"
        })
      );
      resetPaymentForm();
      toast({
        message: "O saldo pendente foi recalculado.",
        title: paymentEditingId ? "Pagamento atualizado" : "Pagamento registrado",
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

  function resetPaymentForm() {
    setPaymentAmount("");
    setPaymentDate(todayInputValue());
    setPaymentEditingId(null);
    setPaymentMethod("PIX");
    setPaymentNote("");
    setPaymentReceipt(null);
    setPaymentReceiptInputKey((current) => current + 1);
    setRemovePaymentReceipt(false);
    setPaymentInvoiceKey("");
    setPaymentInvoice(null);
    setPaymentInvoiceInputKey((current) => current + 1);
    setRemovePaymentInvoice(false);
  }

  function editPayment(payment: DashboardPayment) {
    setPaymentAmount(payment.amount.toString());
    setPaymentDate(payment.paidAt);
    setPaymentEditingId(payment.id);
    setPaymentMethod(payment.method);
    setPaymentNote(payment.note ?? "");
    setPaymentProjectId(payment.projectId);
    setPaymentReceipt(null);
    setPaymentReceiptInputKey((current) => current + 1);
    setRemovePaymentReceipt(false);
    setPaymentInvoiceKey(payment.invoiceKey ?? "");
    setPaymentInvoice(null);
    setPaymentInvoiceInputKey((current) => current + 1);
    setRemovePaymentInvoice(false);
    document.getElementById("payment-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  async function deletePayment(payment: DashboardPayment) {
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

  async function notifyClient(payment: DashboardPayment) {
    const phoneDigits = payment.clientPhone?.replace(/\D/g, "");
    const phone =
      phoneDigits && (phoneDigits.length === 10 || phoneDigits.length === 11)
        ? `55${phoneDigits}`
        : phoneDigits;

    if (!phone) {
      toast({
        message: "Cadastre o telefone do cliente antes de abrir o WhatsApp.",
        title: "Telefone não encontrado",
        tone: "warning"
      });
      return;
    }

    const shareUrl = payment.sharePath
      ? `${window.location.origin}${payment.sharePath}`
      : null;
    const message = buildPaymentMessage({
      amount: payment.amount,
      date: payment.messageDateLabel,
      methodLabel: payment.methodLabel,
      note: payment.note,
      projectName: payment.projectName,
      shareUrl
    });

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    if (!payment.notified) {
      try {
        await readResponse(
          await fetch(`/api/payments/${payment.id}/notify`, {
            method: "POST"
          })
        );
        router.refresh();
      } catch {
        // O envio pelo WhatsApp já foi aberto; ignorar falha ao registrar o estado.
      }
    }
  }

  async function sharePayment(payment: DashboardPayment) {
    const shareUrl = payment.sharePath
      ? `${window.location.origin}${payment.sharePath}`
      : null;
    const message = buildPaymentMessage({
      amount: payment.amount,
      date: payment.messageDateLabel,
      methodLabel: payment.methodLabel,
      note: payment.note,
      projectName: payment.projectName,
      shareUrl
    });

    if (navigator.share) {
      try {
        await navigator.share({
          text: message,
          title: `Pagamento de ${payment.projectName}`
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyTextToClipboard(message);
    toast({
      message: "A mensagem formatada está pronta para colar.",
      title: "Pagamento copiado",
      tone: "success"
    });
  }

  function openReceiptPreview(payment: DashboardPayment) {
    setReceiptZoom(100);
    setReceiptPreview(payment);
  }

  function openInvoicePreview(payment: DashboardPayment) {
    setInvoiceZoom(100);
    setInvoicePreview(payment);
  }

  async function copyInvoiceKey(invoiceKey: string) {
    try {
      await copyTextToClipboard(invoiceKey);
      toast({
        message: "A chave da nota fiscal está na área de transferência.",
        title: "Chave copiada",
        tone: "success"
      });
    } catch {
      toast({
        message: "Não foi possível copiar a chave da nota fiscal.",
        title: "Erro ao copiar",
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
    setRecordComposerOpen(true);
    window.setTimeout(() => {
      const form = document.getElementById("registros");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
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
      if (fixedView === "records") {
        setRecordComposerOpen(false);
      }
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

  async function createShareLink() {
    if (!projectDraft) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = await readResponse(
        await fetch(`/api/projects/${projectDraft.id}/share`, {
          method: "POST"
        })
      );
      const path = payload.path ?? null;

      setProjectDraft((current) => (current ? { ...current, sharePath: path } : current));
      window.dispatchEvent(new Event("worklog-notifications-refresh"));
      toast({
        message: "O projeto agora possui uma visualização pública somente leitura.",
        title: "Link compartilhado criado",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível criar o link.",
        title: "Erro ao compartilhar",
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function disableShareLink() {
    if (!projectDraft) {
      return;
    }

    setIsSaving(true);

    try {
      await readResponse(
        await fetch(`/api/projects/${projectDraft.id}/share`, {
          method: "DELETE"
        })
      );
      setProjectDraft((current) => (current ? { ...current, sharePath: null } : current));
      toast({
        message: "O endereço público deixou de aceitar acessos.",
        title: "Link desativado",
        tone: "success"
      });
      router.refresh();
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "Não foi possível desativar o link.",
        title: "Erro ao desativar",
        tone: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function copyShareLink() {
    if (!projectDraft?.sharePath) {
      return;
    }

    await copyTextToClipboard(`${window.location.origin}${projectDraft.sharePath}`);
    toast({
      message: "O endereço somente leitura está na área de transferência.",
      title: "Link copiado",
      tone: "success"
    });
  }

  function buildReminderText() {
    if (!projectDraft) {
      return null;
    }

    if (!projectDraft.reminderDueDate) {
      toast({
        message: "Informe a data do lembrete antes de enviar.",
        title: "Lembrete incompleto",
        tone: "error"
      });
      return null;
    }

    const fixedAmount = Number(projectDraft.reminderFixedAmount.replace(",", "."));
    const amount =
      projectDraft.reminderAmountMode === "FIXED" ? fixedAmount : projectDraft.pendingValue;

    if (!(amount > 0)) {
      toast({
        message: "O valor do lembrete precisa ser maior que zero.",
        title: "Valor inválido",
        tone: "error"
      });
      return null;
    }

    const shareUrl = projectDraft.sharePath
      ? `${window.location.origin}${projectDraft.sharePath}`
      : null;

    return buildReminderMessage({
      amount,
      dueDateLabel: projectDraft.reminderDueDate.split("-").reverse().join("/"),
      message: projectDraft.reminderMessage,
      projectName: projectDraft.name,
      shareUrl
    });
  }

  function sendReminderWhatsApp() {
    const message = buildReminderText();

    if (!message || !projectDraft) {
      return;
    }

    const phoneDigits = projectDraft.clientPhone?.replace(/\D/g, "");
    const phone =
      phoneDigits && (phoneDigits.length === 10 || phoneDigits.length === 11)
        ? `55${phoneDigits}`
        : phoneDigits;

    if (!phone) {
      void copyTextToClipboard(message);
      toast({
        message: "Cliente sem telefone. A mensagem foi copiada para envio manual.",
        title: "Lembrete copiado",
        tone: "warning"
      });
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyReminder() {
    const message = buildReminderText();

    if (!message) {
      return;
    }

    await copyTextToClipboard(message);
    toast({
      message: "A mensagem do lembrete está na área de transferência.",
      title: "Lembrete copiado",
      tone: "success"
    });
  }

  return (
    <>
      <section
        className={[
          fixedView === "records"
            ? "space-y-6"
            : "rounded-lg border border-[color:var(--border)] bg-[var(--surface)]",
          fixedView ? "" : "mt-4"
        ].join(" ")}
        id="operacao"
      >
        {!fixedView ? (
          <div className="flex flex-col gap-4 border-b border-[color:var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Operação</h2>
              <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                Configure projetos, horas dedicadas, clientes e recebimentos.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1 sm:flex sm:w-fit">
              {(["projects", "records", "clients", "payments"] as OperationView[]).map(
                (item) => {
                  const labels: Record<OperationView, string> = {
                    clients: "Clientes",
                    payments: "Pagamentos",
                    projects: "Projetos",
                    records: "Registros"
                  };

                  return (
                    <button
                      className={[
                        "h-9 rounded px-3 text-sm transition-all duration-200 ease-out active:scale-95",
                        view === item
                          ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm"
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
                }
              )}
            </div>
          </div>
        ) : null}

        {view === "projects" ? (
          <div className="space-y-4 p-5">
            {projects.map((project) => (
              <div
                className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4 transition-colors duration-200 hover:border-[color:var(--border-strong)]"
                key={project.id}
              >
                <div className="flex items-start justify-between gap-3">
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
                            : "border-[color:var(--border)] bg-[var(--surface)] text-[color:var(--text-muted)]"
                        ].join(" ")}
                      >
                        {project.statusLabel}
                      </span>
                      <span className="rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs text-[color:var(--text-muted)]">
                        {project.billingMode === "FIXED" ? "Preço fechado" : "Por horas"}
                      </span>
                      {project.reminderEnabled && project.reminderStatusLabel ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs text-[color:var(--text-muted)]">
                          <StatusPulse tone={project.reminderStatusTone} />
                          Lembrete: {project.reminderStatusLabel}
                        </span>
                      ) : null}
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
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      aria-label={`Notas do projeto ${project.name}`}
                      className="grid h-10 w-10 place-items-center rounded-md border border-[color:var(--border)] bg-[var(--surface)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:border-[color:var(--border-strong)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.98]"
                      onClick={() => setNotesProject({ id: project.id, name: project.name })}
                      title="Notas e tarefas internas"
                      type="button"
                    >
                      <ClipboardList className="size-4" />
                    </button>
                    <button
                      className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-[color:var(--border)] bg-[var(--surface)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:border-[color:var(--border-strong)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.98]"
                      onClick={() => openProject(project)}
                      type="button"
                    >
                      {project.statusLabel === "Pendente" ? (
                        <Settings2 className="size-4" />
                      ) : (
                        <Pencil className="size-4" />
                      )}
                      <span className="hidden sm:inline">
                        {project.statusLabel === "Pendente" ? "Configurar" : "Editar"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)]">
                      Horas WakaTime
                    </p>
                    <p className="mt-1 text-sm">{project.wakatimeLabel}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                      Total {project.globalWakaTimeLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)]">
                      Horas Dedicadas
                    </p>
                    <p className="mt-1 text-sm">{project.dedicatedLabel}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                      Total {project.globalDedicatedLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)]">
                      {project.billingMode === "FIXED" ? "Preço fechado" : "Valor Gerado"}
                    </p>
                    <p className="mt-1 text-sm">{project.totalValueLabel}</p>
                    {project.billingMode === "FIXED" ? (
                      <p
                        className={[
                          "mt-1 text-xs",
                          project.comparisonPositive
                            ? "text-emerald-400"
                            : "text-[color:var(--text-soft)]"
                        ].join(" ")}
                      >
                        Por horas {project.hoursComparisonLabel} ({project.comparisonDeltaLabel})
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)]">
                      Valor Recebido
                    </p>
                    <p className="mt-1 text-sm">{project.receivedValueLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--text-faint)]">
                      {project.pendingIsCredit ? "Excedente" : "Valor Pendente"}
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm",
                        project.pendingIsCredit ? "text-emerald-400" : ""
                      ].join(" ")}
                    >
                      {project.pendingValueLabel}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[color:var(--text-soft)]">
                      <StatusPulse tone={project.projectStatusTone} />
                      {project.projectStatusLabel}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {view === "records" ? (
          <>
          <div
            className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5"
            id="registros"
          >
            {fixedView === "records" ? (
              <div
                className={[
                  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                  recordComposerOpen
                    ? "mb-5 border-b border-[color:var(--border)] pb-5"
                    : ""
                ].join(" ")}
              >
                <div>
                  <h2 className="text-lg font-semibold">Operações de trabalho</h2>
                  <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                    Registre intervalos dedicados e acompanhe o histórico.
                  </p>
                </div>
                <button
                  className="button-primary inline-flex h-10 w-fit items-center gap-2 px-3 text-sm font-medium transition-transform duration-200 active:scale-95"
                  onClick={() => {
                    resetWorkOperation();
                    setRecordComposerOpen((current) => !current);
                  }}
                  type="button"
                >
                  {recordComposerOpen ? <X className="size-4" /> : <Plus className="size-4" />}
                  {recordComposerOpen ? "Fechar operação" : "Adicionar operação"}
                </button>
              </div>
            ) : null}

            {recordComposerOpen ? (
              <form className="grid grid-cols-1 gap-4" noValidate onSubmit={saveWorkOperation}>
              <label className="block min-w-0 max-w-md">
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

              <div className="min-w-0">
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
                    const start = splitDateTimeValue(interval.startedAt);
                    const end = splitDateTimeValue(interval.endedAt);
                    const setIntervalValue = (
                      field: "endedAt" | "startedAt",
                      value: string
                    ) =>
                      setWorkOperationDraft((current) => ({
                        ...current,
                        intervals: current.intervals.map((currentInterval) =>
                          currentInterval.key === interval.key
                            ? { ...currentInterval, [field]: value }
                            : currentInterval
                        )
                      }));

                    return (
                      <div
                        className="grid min-w-0 grid-cols-1 gap-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                        key={interval.key}
                      >
                        <div className="min-w-0">
                          <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                            Início {index + 1}
                          </span>
                          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
                            <DateField
                              ariaLabel={`Data de início ${index + 1}`}
                              onChange={(value) =>
                                setIntervalValue(
                                  "startedAt",
                                  joinDateTimeValue(value, start.time)
                                )
                              }
                              value={start.date}
                            />
                            <TimeField
                              ariaLabel={`Hora de início ${index + 1}`}
                              onChange={(value) =>
                                setIntervalValue(
                                  "startedAt",
                                  joinDateTimeValue(start.date, value)
                                )
                              }
                              value={start.time}
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
                            <span>Término {index + 1}</span>
                            {intervalDuration ? (
                              <span className="text-[color:var(--app-text-strong)]">
                                {intervalDuration}
                              </span>
                            ) : null}
                          </span>
                          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
                            <DateField
                              ariaLabel={`Data de término ${index + 1}`}
                              onChange={(value) =>
                                setIntervalValue(
                                  "endedAt",
                                  joinDateTimeValue(value, end.time)
                                )
                              }
                              value={end.date}
                            />
                            <TimeField
                              ariaLabel={`Hora de término ${index + 1}`}
                              onChange={(value) =>
                                setIntervalValue(
                                  "endedAt",
                                  joinDateTimeValue(end.date, value)
                                )
                              }
                              value={end.time}
                            />
                          </div>
                        </div>
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
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
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
                      onClick={() => {
                        resetWorkOperation();
                        if (fixedView === "records") {
                          setRecordComposerOpen(false);
                        }
                      }}
                      type="button"
                    >
                      Cancelar
                    </button>
                  ) : null}
                  <button
                    className="button-primary h-11 px-4 text-sm font-medium disabled:opacity-60"
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
            ) : null}
          </div>

          <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-5">
            <h3 className="mb-1 text-base font-semibold text-amber-400">Histórico</h3>
            <p className="mb-3 text-xs text-[color:var(--text-soft)]">
              Todas as operações registradas no período carregado.
            </p>

            <div className="divide-y divide-[color:var(--border)] border-t border-[color:var(--border)]">
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        aria-label={`Editar operação de ${operation.projectName}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
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
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
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
          </>
        ) : null}

        {view === "clients" ? (
          <div id="clientes">
            <div className="flex justify-end px-5 pt-5">
              <button
                className="button-primary inline-flex h-10 items-center gap-2 px-3 text-sm font-medium"
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
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[color:var(--app-text-strong)]">
                          {client.name}
                        </p>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-xs text-[color:var(--text-muted)]">
                          <StatusPulse tone={client.statusTone} />
                          {client.statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                        {client.projectCount} projetos
                        {client.email ? ` · ${client.email}` : ""}
                        {client.taxId ? ` · ${formatTaxId(client.taxId)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        aria-label={`Editar ${client.name}`}
                        className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
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
              className="border-b border-[color:var(--border)] pb-6"
              id="payment-form"
              noValidate
              onSubmit={savePayment}
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {paymentEditingId ? "Editar pagamento" : "Registrar pagamento"}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                    O histórico atualiza imediatamente os valores recebidos e pendentes.
                  </p>
                </div>
                {paymentEditingId ? (
                  <button
                    className="h-9 w-fit rounded-md border border-[color:var(--border)] px-3 text-xs text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                    onClick={resetPaymentForm}
                    type="button"
                  >
                    Cancelar edição
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Projeto
                  </span>
                  <span className="relative block">
                    <select
                      className={selectClass}
                      onChange={(event) => setPaymentProjectId(event.target.value)}
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
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Valor recebido
                  </span>
                  <input
                    className={fieldClass}
                    inputMode="decimal"
                    min="0.01"
                    onChange={(event) => setPaymentAmount(event.target.value)}
                    placeholder="0,00"
                    step="0.01"
                    type="number"
                    value={paymentAmount}
                  />
                </label>

                <div className="block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Data
                  </span>
                  <DateField
                    ariaLabel="Data do pagamento"
                    onChange={(value) => setPaymentDate(value)}
                    value={paymentDate}
                  />
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Forma de pagamento
                  </span>
                  <span className="relative block">
                    <select
                      className={selectClass}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value as PaymentMethodValue)
                      }
                      value={paymentMethod}
                    >
                      {PAYMENT_METHODS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
                    />
                  </span>
                </label>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.7fr)_auto] lg:items-end">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Observação
                  </span>
                  <input
                    className={fieldClass}
                    onChange={(event) => setPaymentNote(event.target.value)}
                    placeholder="Referência ou detalhe opcional"
                    value={paymentNote}
                  />
                </label>

                <div className="block">
                  <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
                    <span>Comprovante</span>
                    <span className="text-[color:var(--text-faint)]">PDF, PNG, JPG, JPEG, WEBP · até 4 MB</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label
                      className={[
                        "group inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md border px-3 text-sm transition-colors duration-200 active:scale-[0.99]",
                        paymentReceipt
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-[color:var(--border)] bg-[var(--input-bg)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                      ].join(" ")}
                    >
                      {isSaving && paymentReceipt ? (
                        <Loader2 className="size-4 shrink-0 animate-spin" />
                      ) : (
                        <Paperclip className="size-4 shrink-0 transition-transform duration-200 group-hover:-rotate-12" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-left">
                        {paymentReceipt
                          ? paymentReceipt.name
                          : removePaymentReceipt
                            ? "Comprovante será removido"
                            : "Anexar comprovante"}
                      </span>
                      {paymentReceipt ? (
                        <span className="shrink-0 text-xs text-emerald-400/70">
                          {formatFileSize(paymentReceipt.size)}
                        </span>
                      ) : null}
                      <input
                        accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                        className="sr-only"
                        key={paymentReceiptInputKey}
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;

                          if (file && file.size > 4 * 1024 * 1024) {
                            setPaymentReceipt(null);
                            setPaymentReceiptInputKey((current) => current + 1);
                            toast({
                              message: "Selecione um arquivo de até 4 MB.",
                              title: "Comprovante muito grande",
                              tone: "error"
                            });
                            return;
                          }

                          if (file) {
                            toast({
                              message: `${file.name} pronto para anexar.`,
                              title: "Comprovante selecionado",
                              tone: "success"
                            });
                          }

                          setPaymentReceipt(file);
                          setRemovePaymentReceipt(false);
                        }}
                        type="file"
                      />
                    </label>
                    {paymentReceipt ? (
                      <button
                        aria-label="Remover comprovante selecionado"
                        className="grid size-11 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
                        onClick={() => {
                          setPaymentReceipt(null);
                          setPaymentReceiptInputKey((current) => current + 1);
                        }}
                        type="button"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <button
                  className="button-primary h-11 px-4 text-sm font-medium disabled:opacity-60"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving
                    ? "Salvando"
                    : paymentEditingId
                      ? "Salvar alterações"
                      : "Registrar"}
                </button>
              </div>

              {paymentEditingId &&
              payments.find((payment) => payment.id === paymentEditingId)?.hasReceipt ? (
                <label className="mt-3 inline-flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                  <input
                    checked={removePaymentReceipt}
                    className="size-4 accent-emerald-500"
                    onChange={(event) => setRemovePaymentReceipt(event.target.checked)}
                    type="checkbox"
                  />
                  Remover o comprovante atual ao salvar
                </label>
              ) : null}

              <div className="mt-5 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ReceiptText className="size-4 text-sky-400" />
                  <span className="text-sm font-medium text-[color:var(--app-text-strong)]">
                    Nota fiscal
                  </span>
                  <span className="text-xs text-[color:var(--text-faint)]">
                    Guardada separadamente do comprovante
                  </span>
                </div>

                <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.8fr)]">
                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                      Chave NFS-e / NF-e
                    </span>
                    <input
                      className={fieldClass}
                      onChange={(event) => setPaymentInvoiceKey(event.target.value)}
                      placeholder="Opcional. Ex.: 3303302225943316300010000000000000112605..."
                      value={paymentInvoiceKey}
                    />
                  </label>

                  <div className="block">
                    <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
                      <span>Arquivo da nota fiscal</span>
                      <span className="text-[color:var(--text-faint)]">
                        PDF, XML, PNG, JPG, JPEG, WEBP, ZIP · até 8 MB
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <label
                        className={[
                          "group inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md border px-3 text-sm transition-colors duration-200 active:scale-[0.99]",
                          paymentInvoice
                            ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                            : "border-[color:var(--border)] bg-[var(--input-bg)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                        ].join(" ")}
                      >
                        {isSaving && paymentInvoice ? (
                          <Loader2 className="size-4 shrink-0 animate-spin" />
                        ) : (
                          <Paperclip className="size-4 shrink-0 transition-transform duration-200 group-hover:-rotate-12" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-left">
                          {paymentInvoice
                            ? paymentInvoice.name
                            : removePaymentInvoice
                              ? "Nota fiscal será removida"
                              : "Anexar nota fiscal"}
                        </span>
                        {paymentInvoice ? (
                          <span className="shrink-0 text-xs text-sky-400/70">
                            {formatFileSize(paymentInvoice.size)}
                          </span>
                        ) : null}
                        <input
                          accept=".pdf,.xml,.png,.jpg,.jpeg,.webp,.zip,application/pdf,application/xml,text/xml,image/png,image/jpeg,image/webp,application/zip,application/x-zip-compressed"
                          className="sr-only"
                          key={paymentInvoiceInputKey}
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;

                            if (file && file.size > 8 * 1024 * 1024) {
                              setPaymentInvoice(null);
                              setPaymentInvoiceInputKey((current) => current + 1);
                              toast({
                                message: "Selecione um arquivo de até 8 MB.",
                                title: "Nota fiscal muito grande",
                                tone: "error"
                              });
                              return;
                            }

                            if (file) {
                              toast({
                                message: `${file.name} pronto para anexar.`,
                                title: "Nota fiscal selecionada",
                                tone: "success"
                              });
                            }

                            setPaymentInvoice(file);
                            setRemovePaymentInvoice(false);
                          }}
                          type="file"
                        />
                      </label>
                      {paymentInvoice ? (
                        <button
                          aria-label="Remover nota fiscal selecionada"
                          className="grid size-11 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
                          onClick={() => {
                            setPaymentInvoice(null);
                            setPaymentInvoiceInputKey((current) => current + 1);
                          }}
                          type="button"
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {paymentEditingId &&
                payments.find((payment) => payment.id === paymentEditingId)?.hasInvoice ? (
                  <label className="mt-3 inline-flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                    <input
                      checked={removePaymentInvoice}
                      className="size-4 accent-sky-500"
                      onChange={(event) => setRemovePaymentInvoice(event.target.checked)}
                      type="checkbox"
                    />
                    Remover a nota fiscal atual ao salvar
                  </label>
                ) : null}
              </div>
            </form>

            <div className="pt-6">
              <h2 className="text-lg font-semibold text-amber-400">Histórico de pagamentos</h2>
              <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                Edite dados, consulte comprovantes ou avise o cliente pelo WhatsApp.
              </p>
            </div>

            <div className="mt-3 divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div
                    className="grid gap-4 py-5 text-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                    key={payment.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-medium text-[color:var(--app-text-strong)]">
                          {payment.projectName}
                        </p>
                        <span className="text-[color:var(--text-muted)]">
                          {payment.paidAtLabel}
                        </span>
                        <span className="rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-xs text-[color:var(--text-muted)]">
                          {payment.methodLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[color:var(--text-soft)]">
                        <span className="text-[color:var(--text-faint)]">Observação: </span>
                        {payment.note ?? "Sem observação"}
                      </p>
                      {payment.hasReceipt ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-md border border-emerald-500/15 bg-emerald-500/6 px-2.5 py-1.5 text-xs text-emerald-400">
                            <FileText className="size-3.5 shrink-0" />
                            <span className="truncate">
                              {payment.receiptName ?? "Comprovante anexado"}
                            </span>
                            {formatFileSize(payment.receiptSize) ? (
                              <span className="shrink-0 text-emerald-400/60">
                                · {formatFileSize(payment.receiptSize)}
                              </span>
                            ) : null}
                          </span>
                          <button
                            aria-label={`Visualizar comprovante de ${payment.projectName}`}
                            className="grid size-9 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                            onClick={() => openReceiptPreview(payment)}
                            title="Visualizar comprovante"
                            type="button"
                          >
                            <Eye className="size-4" />
                          </button>
                          <a
                            aria-label={`Baixar comprovante de ${payment.projectName}`}
                            className="grid size-9 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                            href={`/api/payments/${payment.id}/receipt?download=1`}
                            title="Baixar comprovante"
                          >
                            <Download className="size-4" />
                          </a>
                        </div>
                      ) : null}
                      {payment.hasInvoice || payment.invoiceKey ? (
                        <div className="mt-2 rounded-md border border-sky-500/15 bg-sky-500/[0.05] p-2.5">
                          <div className="flex items-center gap-2">
                            <ReceiptText className="size-3.5 shrink-0 text-sky-400" />
                            <span className="text-xs font-medium text-sky-400">Nota fiscal</span>
                          </div>
                          {payment.invoiceKey ? (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="min-w-0 flex-1 truncate rounded bg-[var(--surface-subtle)] px-2 py-1 text-xs text-[color:var(--text-soft)]">
                                <span className="text-[color:var(--text-faint)]">Chave: </span>
                                {payment.invoiceKey}
                              </span>
                              <button
                                aria-label={`Copiar chave da nota fiscal de ${payment.projectName}`}
                                className="grid size-9 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                                onClick={() => void copyInvoiceKey(payment.invoiceKey ?? "")}
                                title="Copiar chave da nota fiscal"
                                type="button"
                              >
                                <Copy className="size-4" />
                              </button>
                            </div>
                          ) : null}
                          {payment.hasInvoice ? (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-md border border-sky-500/15 bg-sky-500/[0.06] px-2.5 py-1.5 text-xs text-sky-400">
                                <FileText className="size-3.5 shrink-0" />
                                <span className="truncate">
                                  {payment.invoiceName ?? "Nota fiscal anexada"}
                                </span>
                                {formatFileSize(payment.invoiceSize) ? (
                                  <span className="shrink-0 text-sky-400/60">
                                    · {formatFileSize(payment.invoiceSize)}
                                  </span>
                                ) : null}
                              </span>
                              {payment.invoiceMimeType?.startsWith("image/") ||
                              payment.invoiceMimeType === "application/pdf" ? (
                                <button
                                  aria-label={`Visualizar nota fiscal de ${payment.projectName}`}
                                  className="grid size-9 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                                  onClick={() => openInvoicePreview(payment)}
                                  title="Visualizar nota fiscal"
                                  type="button"
                                >
                                  <Eye className="size-4" />
                                </button>
                              ) : null}
                              <a
                                aria-label={`Baixar nota fiscal de ${payment.projectName}`}
                                className="grid size-9 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                                href={`/api/payments/${payment.id}/invoice?download=1`}
                                title="Baixar nota fiscal"
                              >
                                <Download className="size-4" />
                              </a>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <strong className="mr-auto text-base lg:mr-2">{payment.amountLabel}</strong>
                      <button
                        aria-label={`Compartilhar pagamento de ${payment.amountLabel}`}
                        className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                        onClick={() => void sharePayment(payment)}
                        title="Compartilhar pagamento"
                        type="button"
                      >
                        <Share2 className="size-4" />
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-xs text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.97]"
                        onClick={() => void notifyClient(payment)}
                        type="button"
                      >
                        <FaWhatsapp className="size-4" />
                        {payment.notified ? "Reenviar" : "Enviar"}
                      </button>
                      <button
                        aria-label={`Editar pagamento de ${payment.amountLabel}`}
                        className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
                        onClick={() => editPayment(payment)}
                        title="Editar pagamento"
                        type="button"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        aria-label={`Remover pagamento de ${payment.amountLabel}`}
                        className="grid size-9 place-items-center rounded-md border border-red-500/20 text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
                        onClick={() => setPaymentConfirmation({ payment })}
                        title="Excluir pagamento"
                        type="button"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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
                  Status do Projeto
                </span>
                <span className="relative block">
                  <select
                    className={selectClass}
                    onChange={(event) =>
                      setProjectDraft((current) =>
                        current
                          ? {
                              ...current,
                              status: event.target.value as ProjectStatusValue
                            }
                          : current
                      )
                    }
                    value={projectDraft.status}
                  >
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
                  />
                </span>
                {(() => {
                  const meta = PROJECT_STATUSES.find(
                    (status) => status.value === projectDraft.status
                  );

                  return meta ? (
                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${meta.badgeClass}`}
                    >
                      <StatusPulse tone={meta.tone} />
                      {meta.label}
                    </span>
                  ) : null;
                })()}
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
              <span className="block text-sm font-medium text-[color:var(--app-text-strong)]">
                Tipo de cobrança
              </span>
              <span className="mt-1 block text-xs text-[color:var(--text-soft)]">
                Cobre por horas trabalhadas ou por um preço fechado combinado.
              </span>
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] p-1">
                {(
                  [
                    ["HOURLY", "Por horas"],
                    ["FIXED", "Preço fechado"]
                  ] as const
                ).map(([value, label]) => (
                  <button
                    aria-pressed={projectDraft.billingMode === value}
                    className={[
                      "h-9 rounded text-sm transition-all duration-200 ease-out active:scale-95",
                      projectDraft.billingMode === value
                        ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm"
                        : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
                    ].join(" ")}
                    key={value}
                    onClick={() =>
                      setProjectDraft((current) =>
                        current ? { ...current, billingMode: value } : current
                      )
                    }
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              {projectDraft.billingMode === "FIXED" ? (
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                    Preço fechado do projeto
                  </span>
                  <input
                    className={fieldClass}
                    inputMode="decimal"
                    onChange={(event) =>
                      setProjectDraft((current) =>
                        current ? { ...current, fixedPrice: event.target.value } : current
                      )
                    }
                    placeholder="Ex.: 3.000,00"
                    type="text"
                    value={projectDraft.fixedPrice}
                  />
                  <span className="mt-2 block text-xs text-[color:var(--text-faint)]">
                    Esse valor vira o total do projeto. Os valores por hora acima continuam
                    salvos e servem só como comparação interna.
                  </span>
                </label>
              ) : null}
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
                Repositório Git
              </span>
              <input
                className={fieldClass}
                onChange={(event) =>
                  setProjectDraft((current) =>
                    current ? { ...current, repositoryUrl: event.target.value } : current
                  )
                }
                placeholder="https://github.com/usuario/projeto"
                type="url"
                value={projectDraft.repositoryUrl}
              />
            </label>
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
            <div className="rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--app-text-strong)]">
                    <Link2 className="size-4" />
                    Compartilhamento
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--text-soft)]">
                    Link somente leitura para horas, valores e pagamentos.
                  </p>
                  {projectDraft.sharePath ? (
                    <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                      {projectDraft.shareAccessCount}{" "}
                      {projectDraft.shareAccessCount === 1 ? "acesso" : "acessos"}
                    </p>
                  ) : null}
                </div>
                {projectDraft.sharePath ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      aria-label="Copiar link compartilhável"
                      className="grid size-10 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                      onClick={() => void copyShareLink()}
                      title="Copiar link"
                      type="button"
                    >
                      <Copy className="size-4" />
                    </button>
                    <a
                      aria-label="Abrir link compartilhável"
                      className="grid size-10 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                      href={projectDraft.sharePath}
                      rel="noreferrer"
                      target="_blank"
                      title="Abrir link"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <button
                      className="h-10 rounded-md border border-red-500/25 px-3 text-sm text-red-400 hover:bg-red-500/10"
                      disabled={isSaving}
                      onClick={() => void disableShareLink()}
                      type="button"
                    >
                      Desativar
                    </button>
                  </div>
                ) : (
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border-strong)] px-3 text-sm font-medium text-[color:var(--app-text-strong)] hover:bg-[var(--hover-bg)] disabled:opacity-60"
                    disabled={isSaving}
                    onClick={() => void createShareLink()}
                    type="button"
                  >
                    <Link2 className="size-4" />
                    Compartilhar
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4">
              <button
                aria-checked={projectDraft.reminderEnabled}
                className="flex w-full items-center justify-between gap-4 text-left"
                onClick={() =>
                  setProjectDraft((current) =>
                    current
                      ? { ...current, reminderEnabled: !current.reminderEnabled }
                      : current
                  )
                }
                role="switch"
                type="button"
              >
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--app-text-strong)]">
                    <Bell className="size-4" />
                    Lembrete de pagamento
                  </span>
                  <span className="mt-1 block text-xs text-[color:var(--text-soft)]">
                    Gera uma notificação interna na data e prepara a cobrança pelo WhatsApp.
                  </span>
                </span>
                <span
                  aria-hidden
                  className={[
                    "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
                    projectDraft.reminderEnabled
                      ? "border-emerald-500/40 bg-emerald-500/25"
                      : "border-[color:var(--border-strong)] bg-[var(--input-bg)]"
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-[var(--app-text-strong)] transition-[left]",
                      projectDraft.reminderEnabled ? "left-6" : "left-1"
                    ].join(" ")}
                  />
                </span>
              </button>

              {projectDraft.reminderEnabled ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                      Tipo de valor
                    </span>
                    <div className="grid grid-cols-2 gap-1 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] p-1">
                      {REMINDER_AMOUNT_MODES.map(([value, label]) => (
                        <button
                          aria-pressed={projectDraft.reminderAmountMode === value}
                          className={[
                            "h-9 rounded px-2 text-xs transition-all duration-200 ease-out active:scale-95 sm:text-sm",
                            projectDraft.reminderAmountMode === value
                              ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm"
                              : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
                          ].join(" ")}
                          key={value}
                          onClick={() =>
                            setProjectDraft((current) =>
                              current
                                ? { ...current, reminderAmountMode: value }
                                : current
                            )
                          }
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {projectDraft.reminderAmountMode === "FIXED" ? (
                      <label className="block">
                        <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                          Valor fixo
                        </span>
                        <input
                          className={fieldClass}
                          inputMode="decimal"
                          onChange={(event) =>
                            setProjectDraft((current) =>
                              current
                                ? { ...current, reminderFixedAmount: event.target.value }
                                : current
                            )
                          }
                          placeholder="Ex.: 500,00"
                          type="text"
                          value={projectDraft.reminderFixedAmount}
                        />
                      </label>
                    ) : (
                      <div className="block">
                        <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                          Valor pendente atual
                        </span>
                        <p className="flex h-11 items-center rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[color:var(--app-text-strong)]">
                          {projectDraft.pendingValueLabel}
                        </p>
                      </div>
                    )}
                    <div className="block">
                      <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                        Data do lembrete
                      </span>
                      <DateField
                        ariaLabel="Data do lembrete"
                        onChange={(value) =>
                          setProjectDraft((current) =>
                            current ? { ...current, reminderDueDate: value } : current
                          )
                        }
                        value={projectDraft.reminderDueDate}
                      />
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                      Observação / mensagem (opcional)
                    </span>
                    <textarea
                      className={textareaClass}
                      onChange={(event) =>
                        setProjectDraft((current) =>
                          current ? { ...current, reminderMessage: event.target.value } : current
                        )
                      }
                      placeholder="Ex.: Lembrete referente à segunda etapa do projeto."
                      value={projectDraft.reminderMessage}
                    />
                  </label>

                  {!projectDraft.clientPhone ? (
                    <p className="text-xs text-[color:var(--warning-text)]">
                      O cliente não tem telefone cadastrado. A mensagem será copiada para envio
                      manual.
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-500/30 px-3 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 active:scale-[0.98]"
                      onClick={sendReminderWhatsApp}
                      type="button"
                    >
                      <FaWhatsapp className="size-4" />
                      Enviar no WhatsApp
                    </button>
                    <button
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.98]"
                      onClick={() => void copyReminder()}
                      type="button"
                    >
                      <Copy className="size-4" />
                      Copiar mensagem
                    </button>
                  </div>
                  <p className="text-xs text-[color:var(--text-faint)]">
                    O lembrete é salvo junto com o projeto e nunca envia nada automaticamente para o
                    cliente.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="h-10 rounded-md border border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)]"
                onClick={() => setProjectDraft(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button-primary h-10 px-4 text-sm font-medium disabled:opacity-60"
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
                    : "button-primary"
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

      {paymentConfirmation ? (
        <Modal onClose={() => setPaymentConfirmation(null)} title="Excluir pagamento">
          <div className="p-5">
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              Excluir este pagamento recalculará o saldo do projeto. O comprovante relacionado
              também será removido do Storage quando estiver configurado.
            </p>
            <p className="mt-2 text-xs text-[color:var(--text-soft)]">
              {paymentConfirmation.payment.projectName} ·{" "}
              {paymentConfirmation.payment.amountLabel}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-10 rounded-md border border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                onClick={() => setPaymentConfirmation(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-md bg-red-500 px-4 text-sm font-medium text-white transition-colors hover:bg-red-600"
                onClick={() => {
                  const payment = paymentConfirmation.payment;
                  setPaymentConfirmation(null);
                  void deletePayment(payment);
                }}
                type="button"
              >
                Excluir pagamento
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {receiptPreview ? (
        <Modal
          onClose={() => setReceiptPreview(null)}
          title={receiptPreview.receiptName ?? "Comprovante"}
        >
          <div className="p-5">
            {receiptPreview.receiptMimeType?.startsWith("image/") ? (
              <>
                <div className="mb-3 flex items-center justify-end gap-2">
                  <button
                    aria-label="Reduzir imagem"
                    className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                    disabled={receiptZoom <= 75}
                    onClick={() => setReceiptZoom((current) => Math.max(75, current - 25))}
                    title="Reduzir"
                    type="button"
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  <span className="min-w-12 text-center text-xs text-[color:var(--text-soft)]">
                    {receiptZoom}%
                  </span>
                  <button
                    aria-label="Ampliar imagem"
                    className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                    disabled={receiptZoom >= 200}
                    onClick={() => setReceiptZoom((current) => Math.min(200, current + 25))}
                    title="Ampliar"
                    type="button"
                  >
                    <ZoomIn className="size-4" />
                  </button>
                </div>
                <div className="max-h-[62vh] min-h-80 overflow-auto rounded-md border border-[color:var(--border)] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Comprovante de ${receiptPreview.projectName}`}
                    className="mx-auto block h-auto max-w-none"
                    src={`/api/payments/${receiptPreview.id}/receipt`}
                    style={{ width: `${receiptZoom}%` }}
                  />
                </div>
              </>
            ) : (
              <iframe
                className="h-[62vh] min-h-80 w-full rounded-md border border-[color:var(--border)] bg-white"
                src={`/api/payments/${receiptPreview.id}/receipt`}
                title={`Comprovante de ${receiptPreview.projectName}`}
              />
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[color:var(--text-soft)]">
                {receiptPreview.receiptMimeType ?? "Arquivo privado"}
                {formatFileSize(receiptPreview.receiptSize)
                  ? ` · ${formatFileSize(receiptPreview.receiptSize)}`
                  : ""}
              </p>
              <a
                className="button-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-medium"
                href={`/api/payments/${receiptPreview.id}/receipt?download=1`}
              >
                <Download className="size-4" />
                Baixar comprovante
              </a>
            </div>
          </div>
        </Modal>
      ) : null}

      {notesProject ? (
        <ProjectNotesModal
          onClose={() => setNotesProject(null)}
          projectId={notesProject.id}
          projectName={notesProject.name}
        />
      ) : null}

      {invoicePreview ? (
        <Modal
          onClose={() => setInvoicePreview(null)}
          title={invoicePreview.invoiceName ?? "Nota fiscal"}
        >
          <div className="p-5">
            {invoicePreview.invoiceMimeType?.startsWith("image/") ? (
              <>
                <div className="mb-3 flex items-center justify-end gap-2">
                  <button
                    aria-label="Reduzir imagem"
                    className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                    disabled={invoiceZoom <= 75}
                    onClick={() => setInvoiceZoom((current) => Math.max(75, current - 25))}
                    title="Reduzir"
                    type="button"
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  <span className="min-w-12 text-center text-xs text-[color:var(--text-soft)]">
                    {invoiceZoom}%
                  </span>
                  <button
                    aria-label="Ampliar imagem"
                    className="grid size-9 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                    disabled={invoiceZoom >= 200}
                    onClick={() => setInvoiceZoom((current) => Math.min(200, current + 25))}
                    title="Ampliar"
                    type="button"
                  >
                    <ZoomIn className="size-4" />
                  </button>
                </div>
                <div className="max-h-[62vh] min-h-80 overflow-auto rounded-md border border-[color:var(--border)] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Nota fiscal de ${invoicePreview.projectName}`}
                    className="mx-auto block h-auto max-w-none"
                    src={`/api/payments/${invoicePreview.id}/invoice`}
                    style={{ width: `${invoiceZoom}%` }}
                  />
                </div>
              </>
            ) : (
              <iframe
                className="h-[62vh] min-h-80 w-full rounded-md border border-[color:var(--border)] bg-white"
                src={`/api/payments/${invoicePreview.id}/invoice`}
                title={`Nota fiscal de ${invoicePreview.projectName}`}
              />
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[color:var(--text-soft)]">
                {invoicePreview.invoiceMimeType ?? "Arquivo privado"}
                {formatFileSize(invoicePreview.invoiceSize)
                  ? ` · ${formatFileSize(invoicePreview.invoiceSize)}`
                  : ""}
              </p>
              <a
                className="button-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-medium"
                href={`/api/payments/${invoicePreview.id}/invoice?download=1`}
              >
                <Download className="size-4" />
                Baixar nota fiscal
              </a>
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
            <label className="block">
              <span className="mb-1.5 block text-xs text-[color:var(--text-muted)]">
                Status do cliente
              </span>
              <span className="relative block">
                <select
                  className={selectClass}
                  onChange={(event) =>
                    setClientDraft((current) =>
                      current
                        ? {
                            ...current,
                            status: event.target.value as ClientStatusValue | ""
                          }
                        : current
                    )
                  }
                  value={clientDraft.status}
                >
                  <option value="">Automático (por vínculo com projeto)</option>
                  {CLIENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
                />
              </span>
              <span className="mt-2 block text-xs text-[color:var(--text-faint)]">
                Em automático, o status acompanha o vínculo: com projeto fica Ativo, sem projeto
                fica Sem projeto.
              </span>
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
                    Opcional. Preencha CPF ou CNPJ.
                  </span>
                )}
              </label>
              <div className="block">
                <span className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">
                  <span>Data de nascimento</span>
                  {clientAge !== null ? (
                    <span className="rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-2 py-0.5 text-[color:var(--app-text-strong)]">
                      {clientAge} {clientAge === 1 ? "ano" : "anos"}
                    </span>
                  ) : null}
                </span>
                <DateField
                  ariaLabel="Data de nascimento"
                  max={todayInputValue()}
                  onChange={(value) =>
                    setClientDraft((current) =>
                      current ? { ...current, birthDate: value } : current
                    )
                  }
                  placeholder="Data de nascimento"
                  value={clientDraft.birthDate}
                />
              </div>
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
                className="button-primary h-10 px-4 text-sm font-medium disabled:opacity-60"
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
