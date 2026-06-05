"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { X } from "lucide-react";
import { StatusPulse, type StatusTone } from "@/components/status-pulse";

type ToastTone = StatusTone;

type ToastItem = {
  id: number;
  message: string;
  title?: string;
  tone: ToastTone;
};

type ToastInput = Omit<ToastItem, "id">;

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.round(Math.random() * 1000);

      setToasts((current) => [...current.slice(-2), { ...input, id }]);
      window.setTimeout(() => removeToast(id), 4800);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[200] flex flex-col items-stretch gap-2 sm:left-auto sm:right-5 sm:w-[360px]"
      >
        {toasts.map((item) => (
          <div
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-[color:var(--border-strong)] bg-[var(--toast-bg)] p-4 text-[color:var(--app-text)] shadow-[var(--toast-shadow)] backdrop-blur-xl motion-safe:animate-[toast-enter_.24s_ease-out]"
            key={item.id}
          >
            <StatusPulse className="mt-1" tone={item.tone} />
            <div className="min-w-0 flex-1">
              {item.title ? (
                <p className="text-sm font-medium text-[color:var(--app-text-strong)]">
                  {item.title}
                </p>
              ) : null}
              <p className="text-sm leading-5 text-[color:var(--text-muted)]">{item.message}</p>
            </div>
            <button
              aria-label="Fechar notificação"
              className="grid size-7 shrink-0 place-items-center rounded-md text-[color:var(--text-faint)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
              onClick={() => removeToast(item.id)}
              type="button"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }

  return context;
}
