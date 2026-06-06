"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { copyTextToClipboard } from "@/lib/clipboard";

export function InstallationCodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copyCode() {
    try {
      await copyTextToClipboard(children);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({
        message: "O conteúdo exato do bloco foi copiado.",
        title: "Código copiado",
        tone: "success"
      });
    } catch {
      toast({
        message: "Não foi possível acessar a área de transferência.",
        title: "Falha ao copiar",
        tone: "error"
      });
    }
  }

  return (
    <div className="mt-4 min-w-0 overflow-hidden rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)]">
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--border)] bg-[var(--surface)] px-3 py-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          Código
        </span>
        <button
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[color:var(--border)] bg-[var(--modal-bg)] px-2.5 text-[11px] font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          onClick={() => void copyCode()}
          type="button"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-[color:var(--app-text-strong)]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
