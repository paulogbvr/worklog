export const PROJECT_STATUSES = [
  {
    badgeClass: "border-blue-500/25 bg-blue-500/10 text-blue-400",
    label: "Em desenvolvimento",
    symbol: "🔵",
    value: "DEVELOPMENT"
  },
  {
    badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    label: "Em andamento",
    symbol: "🟢",
    value: "IN_PROGRESS"
  },
  {
    badgeClass: "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",
    label: "Aguardando cliente",
    symbol: "🟡",
    value: "WAITING_CLIENT"
  },
  {
    badgeClass: "border-orange-500/25 bg-orange-500/10 text-orange-400",
    label: "Aguardando pagamento",
    symbol: "🟠",
    value: "WAITING_PAYMENT"
  },
  {
    badgeClass: "border-zinc-500/25 bg-zinc-500/10 text-zinc-400",
    label: "Pausado",
    symbol: "⚪",
    value: "PAUSED"
  },
  {
    badgeClass: "border-emerald-400/35 bg-emerald-500 text-white",
    label: "Concluído",
    symbol: "✅",
    value: "COMPLETED"
  },
  {
    badgeClass: "border-red-500/25 bg-red-500/10 text-red-400",
    label: "Cancelado",
    symbol: "🔴",
    value: "CANCELED"
  }
] as const;

export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number]["value"];

export function getProjectStatusMeta(status: string) {
  return (
    PROJECT_STATUSES.find((item) => item.value === status) ??
    PROJECT_STATUSES.find((item) => item.value === "IN_PROGRESS")!
  );
}
