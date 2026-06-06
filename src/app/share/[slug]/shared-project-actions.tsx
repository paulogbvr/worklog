"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";

export function SharedProjectActions({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await copyTextToClipboard(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
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
        className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border-strong)] bg-[var(--surface-subtle)] px-3 text-sm font-medium text-[color:var(--app-text-strong)] transition-colors hover:bg-[var(--hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        onClick={() => void copyLink()}
        type="button"
      >
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        {copied ? "Link copiado" : "Copiar link"}
      </button>
      <a
        className="button-primary inline-flex h-10 items-center gap-2 px-3 text-sm font-medium"
        href={`/share/${slug}/pdf`}
      >
        <Download className="size-4" />
        Salvar PDF
      </a>
    </div>
  );
}
