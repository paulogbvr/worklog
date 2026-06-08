"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useToast } from "@/components/toast-provider";

export function SharedProjectActions({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copyLink() {
    await copyTextToClipboard(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
    toast({
      message: "O endereço do projeto está na área de transferência.",
      title: "Link copiado",
      tone: "success"
    });
    void fetch(`/api/share/${slug}/events`, {
      body: JSON.stringify({
        type: "COPY_LINK"
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border-strong)] bg-[var(--surface-subtle)] px-3 text-sm font-medium text-[color:var(--app-text-strong)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        onClick={() => void copyLink()}
        type="button"
      >
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        {copied ? "Link copiado" : "Copiar link"}
      </button>
      <a
        className="button-primary inline-flex h-10 items-center gap-2 px-3 text-sm font-medium transition-transform duration-200 active:scale-[0.97]"
        href={`/share/${slug}/pdf`}
        onClick={() =>
          toast({
            message: "O relatório em PDF será baixado em instantes.",
            title: "Gerando PDF",
            tone: "info"
          })
        }
      >
        <Download className="size-4" />
        Salvar PDF
      </a>
    </div>
  );
}
