"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/toast-provider";

type SyncResponse = {
  ok: boolean;
  error?: string;
  result?: {
    daysSynced: number;
    projectsArchived: number;
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
  const archiveText =
    result.projectsArchived === 1
      ? "1 arquivado"
      : `${result.projectsArchived} arquivados`;

  return `${projectText}; ${dayText}; ${result.projectsCreated} novos; ${archiveText}.`;
}

export function SyncNowButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  async function handleSync() {
    setIsSyncing(true);
    toast({
      message: "Buscando projetos e horas recentes.",
      title: "Sincronização iniciada",
      tone: "neutral"
    });

    try {
      const response = await fetch("/api/wakatime/sync", {
        method: "POST"
      });
      const payload = (await response.json()) as SyncResponse;

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? "Não foi possível sincronizar agora.");
      }

      toast({
        message: formatResult(payload.result),
        title: "Sincronização concluída",
        tone: "success"
      });
      window.dispatchEvent(new Event("worklog-notifications-refresh"));
      startRefresh(() => {
        router.refresh();
      });
    } catch (error) {
      toast({
        message:
          error instanceof Error ? error.message : "Não foi possível sincronizar o WakaTime agora.",
        title: "Falha na sincronização",
        tone: "error"
      });
      window.dispatchEvent(new Event("worklog-notifications-refresh"));
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[color:var(--border-strong)] bg-[var(--primary-bg)] text-sm font-medium text-[color:var(--primary-text)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSyncing || isRefreshing}
        onClick={handleSync}
        type="button"
      >
        <span className="grid size-10 place-items-center">
          <RefreshCw
            className={["size-4", isSyncing || isRefreshing ? "animate-spin" : ""].join(" ")}
          />
        </span>
        <span className="pr-4">
          {isSyncing ? "Sincronizando" : isRefreshing ? "Atualizando painel" : "Atualizar agora"}
        </span>
      </button>
    </div>
  );
}
