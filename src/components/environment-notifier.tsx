"use client";

import { useEffect } from "react";
import { useToast } from "@/components/toast-provider";
import type { ServerEnvStatus } from "@/lib/env";

export function EnvironmentNotifier({
  envStatus
}: {
  envStatus: ServerEnvStatus;
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (envStatus.configured) {
      return;
    }

    const invalidKeys = Object.entries(envStatus.keys)
      .filter(([, check]) => check.label !== "ok")
      .map(([key]) => key);
    const signature = invalidKeys.join("|");
    const storageKey = `worklog-env-warning:${signature}`;

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "shown");
    toast({
      message: `Revise ${invalidKeys.join(", ")} no ambiente do servidor.`,
      title: "Variáveis de ambiente pendentes",
      tone: "error"
    });
    void fetch("/api/environment/report", {
      method: "POST"
    }).finally(() => {
      window.dispatchEvent(new Event("worklog-notifications-refresh"));
    });
  }, [envStatus, toast]);

  return null;
}
