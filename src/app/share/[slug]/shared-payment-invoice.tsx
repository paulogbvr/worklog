"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, FileText, ReceiptText, X, ZoomIn, ZoomOut } from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useToast } from "@/components/toast-provider";

export function SharedPaymentInvoice({
  hasFile,
  invoiceKey,
  isImage,
  isViewable,
  paymentId,
  projectName
}: {
  hasFile: boolean;
  invoiceKey: string | null;
  isImage: boolean;
  isViewable: boolean;
  paymentId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const src = `/api/payments/${paymentId}/invoice`;

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function copyKey() {
    if (!invoiceKey) {
      return;
    }

    try {
      await copyTextToClipboard(invoiceKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({
        message: "A chave da nota fiscal está na área de transferência.",
        title: "Chave copiada",
        tone: "success"
      });
    } catch {
      toast({
        message: "Não foi possível copiar a chave. Copie manualmente.",
        title: "Erro ao copiar",
        tone: "error"
      });
    }
  }

  return (
    <div className="mt-3 rounded-md border border-sky-500/20 bg-sky-500/[0.06] p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-sky-400">
        <ReceiptText className="size-3.5" />
        Nota fiscal
      </p>

      {invoiceKey ? (
        <div className="mt-2">
          <p className="text-[11px] uppercase tracking-wide text-[color:var(--text-faint)]">
            Chave
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded bg-[var(--surface-subtle)] px-2 py-1 text-xs text-[color:var(--text-muted)]">
              {invoiceKey}
            </code>
            <button
              aria-label="Copiar chave da nota fiscal"
              className="grid size-8 shrink-0 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.97]"
              onClick={() => void copyKey()}
              title="Copiar chave"
              type="button"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
      ) : null}

      {hasFile ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isViewable ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/25 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-400 transition-all duration-200 ease-out hover:bg-sky-500/20 active:scale-[0.96]"
              onClick={() => {
                setZoom(100);
                setOpen(true);
                toast({
                  message: "Abrindo a nota fiscal.",
                  title: "Nota fiscal",
                  tone: "info"
                });
              }}
              type="button"
            >
              <FileText className="size-3.5" />
              Visualizar nota
            </button>
          ) : null}
          <a
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--border)] px-2.5 py-1.5 text-xs font-medium text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.96]"
            href={`${src}?download=1`}
            onClick={() =>
              toast({
                message: "A nota fiscal será baixada em instantes.",
                title: "Baixando nota fiscal",
                tone: "success"
              })
            }
          >
            <Download className="size-3.5" />
            Baixar nota
          </a>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[180] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[color:var(--border-strong)] bg-[var(--modal-bg)] shadow-[var(--toast-shadow)]"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
              <h3 className="truncate font-semibold text-[color:var(--app-text-strong)]">
                Nota fiscal
              </h3>
              <div className="flex items-center gap-2">
                {isImage ? (
                  <>
                    <button
                      aria-label="Reduzir imagem"
                      className="grid size-8 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] disabled:opacity-40"
                      disabled={zoom <= 75}
                      onClick={() => setZoom((current) => Math.max(75, current - 25))}
                      type="button"
                    >
                      <ZoomOut className="size-4" />
                    </button>
                    <span className="min-w-11 text-center text-xs text-[color:var(--text-soft)]">
                      {zoom}%
                    </span>
                    <button
                      aria-label="Ampliar imagem"
                      className="grid size-8 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] disabled:opacity-40"
                      disabled={zoom >= 200}
                      onClick={() => setZoom((current) => Math.min(200, current + 25))}
                      type="button"
                    >
                      <ZoomIn className="size-4" />
                    </button>
                  </>
                ) : null}
                <a
                  aria-label="Baixar nota fiscal"
                  className="grid size-8 place-items-center rounded-md border border-[color:var(--border)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)]"
                  href={`${src}?download=1`}
                >
                  <Download className="size-4" />
                </a>
                <button
                  aria-label="Fechar"
                  className="grid size-8 place-items-center rounded-md text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 overflow-auto p-5">
              {isImage ? (
                <div className="max-h-[64vh] min-h-72 overflow-auto rounded-md border border-[color:var(--border)] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Nota fiscal de ${projectName}`}
                    className="mx-auto block h-auto max-w-none"
                    src={src}
                    style={{ width: `${zoom}%` }}
                  />
                </div>
              ) : (
                <iframe
                  className="h-[64vh] min-h-72 w-full rounded-md border border-[color:var(--border)] bg-white"
                  src={src}
                  title={`Nota fiscal de ${projectName}`}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
