"use client";

import { useEffect, useState } from "react";
import { Download, FileText, X, ZoomIn, ZoomOut } from "lucide-react";

export function SharedPaymentReceipt({
  isImage,
  paymentId,
  projectName
}: {
  isImage: boolean;
  paymentId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const src = `/api/payments/${paymentId}/receipt`;

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

  return (
    <>
      <button
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 active:scale-[0.98]"
        onClick={() => {
          setZoom(100);
          setOpen(true);
        }}
        type="button"
      >
        <FileText className="size-3.5" />
        Ver comprovante
      </button>

      {open ? (
        <div className="fixed inset-0 z-[180] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            aria-modal="true"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[color:var(--border-strong)] bg-[var(--modal-bg)] shadow-[var(--toast-shadow)]"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
              <h3 className="truncate font-semibold text-[color:var(--app-text-strong)]">
                Comprovante
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
                  aria-label="Baixar comprovante"
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
                    alt={`Comprovante de ${projectName}`}
                    className="mx-auto block h-auto max-w-none"
                    src={src}
                    style={{ width: `${zoom}%` }}
                  />
                </div>
              ) : (
                <iframe
                  className="h-[64vh] min-h-72 w-full rounded-md border border-[color:var(--border)] bg-white"
                  src={src}
                  title={`Comprovante de ${projectName}`}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
