import type { StatusTone } from "@/components/status-pulse";

export const PROJECT_STATUSES = [
  {
    badgeClass: "border-blue-500/25 bg-blue-500/10 text-blue-400",
    label: "Em desenvolvimento",
    tone: "info",
    value: "DEVELOPMENT"
  },
  {
    badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    label: "Em andamento",
    tone: "success",
    value: "IN_PROGRESS"
  },
  {
    badgeClass: "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
    label: "Aguardando cliente",
    tone: "warning",
    value: "WAITING_CLIENT"
  },
  {
    badgeClass: "border-orange-500/25 bg-orange-500/10 text-orange-400",
    label: "Aguardando pagamento",
    tone: "attention",
    value: "WAITING_PAYMENT"
  },
  {
    badgeClass: "border-zinc-500/25 bg-zinc-500/10 text-zinc-400",
    label: "Pausado",
    tone: "neutral",
    value: "PAUSED"
  },
  {
    badgeClass: "border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
    label: "Concluído",
    tone: "done",
    value: "COMPLETED"
  },
  {
    badgeClass: "border-red-500/25 bg-red-500/10 text-red-400",
    label: "Cancelado",
    tone: "error",
    value: "CANCELED"
  }
] as const satisfies ReadonlyArray<{
  badgeClass: string;
  label: string;
  tone: StatusTone;
  value: string;
}>;

export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number]["value"];

export function getProjectStatusMeta(status: string) {
  return (
    PROJECT_STATUSES.find((item) => item.value === status) ??
    PROJECT_STATUSES.find((item) => item.value === "IN_PROGRESS")!
  );
}
