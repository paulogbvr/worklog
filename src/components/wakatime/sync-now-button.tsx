"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

type SyncResponse = {
  ok: boolean;
  error?: string;
  result?: {
    daysSynced: number;
    projectsCreated: number;
    projectsFound: number;
    projectsUpdated: number;
    totalSeconds: number;
  };
};

function formatResult(result: NonNullable<SyncResponse["result"]>) {
  const projectText = result.projectsFound === 1 ? "1 projeto" : `${result.projectsFound} projetos`;
  const dayText =
    result.daysSynced === 1 ? "1 registro diário" : `${result.daysSynced} registros diários`;

  return `${projectText}; ${dayText}; ${result.projectsCreated} novos.`;
}

export function SyncNowButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/wakatime/sync", {
        method: "POST"
      });
      const payload = (await response.json()) as SyncResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? "Não foi possível sincronizar agora.");
      }

      setMessage(formatResult(payload.result));
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível sincronizar agora.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[color:var(--border-strong)] bg-[var(--primary-bg)] text-sm font-medium text-[color:var(--primary-text)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSyncing}
        onClick={handleSync}
        type="button"
      >
        <span className="grid size-10 place-items-center">
          <RefreshCw className={["size-4", isSyncing ? "animate-spin" : ""].join(" ")} />
        </span>
        <span className="pr-4">{isSyncing ? "Sincronizando" : "Atualizar agora"}</span>
      </button>

      {message ? (
        <p className="max-w-xs text-left text-xs text-[color:var(--text-soft)] sm:text-right">
          {message}
        </p>
      ) : null}
    </div>
  );
}
