import type { StatusTone } from "@/components/status-pulse";

// Manual statuses that a client can be assigned in the profile. When a client
// has no manual status (null), the effective status is derived automatically
// from whether the client is linked to at least one project.
export const CLIENT_STATUSES = [
  { label: "Ativo", tone: "success", value: "ACTIVE" },
  { label: "Sem projeto", tone: "neutral", value: "NO_PROJECT" },
  { label: "Em negociação", tone: "info", value: "NEGOTIATING" },
  { label: "Pausado", tone: "warning", value: "PAUSED" },
  { label: "Inativo", tone: "error", value: "INACTIVE" }
] as const satisfies ReadonlyArray<{
  label: string;
  tone: StatusTone;
  value: string;
}>;

export type ClientStatusValue = (typeof CLIENT_STATUSES)[number]["value"];

export function isClientStatusValue(value: unknown): value is ClientStatusValue {
  return (
    typeof value === "string" &&
    CLIENT_STATUSES.some((status) => status.value === value)
  );
}

export function getClientStatusMeta(status: string) {
  return (
    CLIENT_STATUSES.find((item) => item.value === status) ?? CLIENT_STATUSES[0]
  );
}

// Resolves the status shown in the UI: manual override when present, otherwise
// derived from the project link (linked => Ativo, none => Sem projeto).
export function resolveClientStatus(
  manualStatus: string | null,
  projectCount: number
) {
  if (manualStatus && isClientStatusValue(manualStatus)) {
    return getClientStatusMeta(manualStatus);
  }

  return getClientStatusMeta(projectCount > 0 ? "ACTIVE" : "NO_PROJECT");
}
