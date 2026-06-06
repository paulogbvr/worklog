"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck } from "lucide-react";
import { StatusPulse, type StatusTone } from "@/components/status-pulse";

export type NotificationCenterItem = {
  createdAtLabel: string;
  id: string;
  message: string;
  read: boolean;
  title: string;
  tone: StatusTone;
};

export function NotificationsCenter({
  defaultMode = "unread",
  description,
  initialItems,
  showReadControls = true,
  title = "Importantes"
}: {
  defaultMode?: "all" | "unread";
  description?: string;
  initialItems: NotificationCenterItem[];
  showReadControls?: boolean;
  title?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [mode, setMode] = useState<"all" | "unread">(defaultMode);
  const router = useRouter();
  const visibleItems = useMemo(
    () => (mode === "unread" ? items.filter((item) => !item.read) : items),
    [items, mode]
  );
  const unreadCount = items.filter((item) => !item.read).length;

  async function markRead(id: string) {
    const response = await fetch(`/api/notifications/${id}`, {
      method: "PATCH"
    });

    if (response.ok) {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      window.dispatchEvent(new Event("worklog-notifications-refresh"));
      router.refresh();
    }
  }

  async function markAllRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH"
    });

    if (response.ok) {
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      window.dispatchEvent(new Event("worklog-notifications-refresh"));
      router.refresh();
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-4 border-b border-[color:var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-[color:var(--app-text-strong)]">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[color:var(--text-soft)]">
              {description}
            </p>
          ) : null}
        </div>
        {showReadControls ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid w-fit grid-cols-2 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1">
              {(
                [
                  ["unread", `Não lidas (${unreadCount})`],
                  ["all", "Todas"]
                ] as const
              ).map(([value, label]) => (
                <button
                  className={[
                    "h-9 rounded px-3 text-sm transition-colors",
                    mode === value
                      ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)]"
                      : "text-[color:var(--text-muted)]"
                  ].join(" ")}
                  key={value}
                  onClick={() => setMode(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            {unreadCount > 0 ? (
              <button
                className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                onClick={() => void markAllRead()}
                type="button"
              >
                <CheckCheck className="size-4" />
                Marcar todas como lidas
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="divide-y divide-[color:var(--border)]">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <article
              className={[
                "grid gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start",
                item.read ? "opacity-70" : ""
              ].join(" ")}
              key={item.id}
            >
              <StatusPulse className="mt-1" tone={item.tone} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">{item.title}</h2>
                  {showReadControls && !item.read ? (
                    <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      Nova
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {item.message}
                </p>
                <p className="mt-2 text-xs text-[color:var(--text-faint)]">
                  {item.createdAtLabel}
                </p>
              </div>
              {showReadControls && !item.read ? (
                <button
                  aria-label={`Marcar ${item.title} como lida`}
                  className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-xs text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                  onClick={() => void markRead(item.id)}
                  type="button"
                >
                  <Check className="size-3.5" />
                  Marcar como lida
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <p className="p-10 text-center text-sm text-[color:var(--text-soft)]">
            Nenhuma notificação nesta visualização.
          </p>
        )}
      </div>
    </section>
  );
}
