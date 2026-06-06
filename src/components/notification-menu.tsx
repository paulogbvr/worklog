"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { StatusPulse } from "@/components/status-pulse";
import { useToast } from "@/components/toast-provider";

type NotificationItem = {
  createdAt: string;
  id: string;
  message: string;
  projectId: string | null;
  readAt: string | null;
  title: string;
  type:
    | "ENV_WARNING"
    | "PROJECT_STATUS_CHANGED"
    | "SHARE_ACCESSED"
    | "SHARE_COPIED"
    | "SHARE_CREATED"
    | "SHARE_PDF_DOWNLOADED"
    | "SYNC_ERROR"
    | "SYNC_SUCCESS";
};

type NotificationResponse = {
  notifications?: NotificationItem[];
  ok: boolean;
  unreadCount?: number;
};

function relativeTime(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(elapsed / 60_000));

  if (minutes < 1) {
    return "agora";
  }

  if (minutes < 60) {
    return `há ${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours}h`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function notificationTone(type: NotificationItem["type"]) {
  if (type === "ENV_WARNING" || type === "SYNC_ERROR") {
    return "error" as const;
  }

  if (type === "SYNC_SUCCESS" || type === "SHARE_CREATED") {
    return "success" as const;
  }

  return "neutral" as const;
}

export function NotificationMenu({
  className = "",
  mobile = false
}: {
  className?: string;
  mobile?: boolean;
}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [showUnread, setShowUnread] = useState(true);
  const initializedRef = useRef(false);
  const knownIdsRef = useRef(new Set<string>());
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadNotifications = useCallback(async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store"
      });
      const payload = (await response.json()) as NotificationResponse;

      if (response.ok && payload.ok) {
        const notifications = payload.notifications ?? [];
        const newImportant = initializedRef.current
          ? notifications.find(
              (notification) =>
                !notification.readAt && !knownIdsRef.current.has(notification.id)
            )
          : null;

        if (newImportant) {
          toast({
            message: newImportant.message,
            title: newImportant.title,
            tone: notificationTone(newImportant.type)
          });
        }

        knownIdsRef.current = new Set(notifications.map((notification) => notification.id));
        initializedRef.current = true;
        setItems(notifications);
        setUnreadCount(payload.unreadCount ?? 0);
      }
    } catch {
      // A navegação continua disponível mesmo se o painel de notificações falhar.
    }
  }, [toast]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadNotifications();
    }, 0);
    const polling = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);

    function refresh() {
      void loadNotifications();
    }

    window.addEventListener("worklog-notifications-refresh", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(polling);
      window.removeEventListener("worklog-notifications-refresh", refresh);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const visibleItems = useMemo(
    () => (showUnread ? items.filter((item) => !item.readAt) : items),
    [items, showUnread]
  );

  async function markAllRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH"
    });

    if (response.ok) {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    }
  }

  const button = (
    <button
      aria-expanded={open}
      aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
      className={[
        "sidebar-notification-button group relative flex items-center rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]",
        mobile ? "h-11 w-full gap-3 px-3" : "h-11 w-full gap-3 px-3"
      ].join(" ")}
      onClick={() => setOpen((current) => !current)}
      type="button"
    >
      <Bell className="size-[18px] shrink-0" strokeWidth={1.8} />
      <span className="sidebar-nav-label min-w-0 flex-1 truncate text-left text-sm font-medium">
        Notificações
      </span>
      {unreadCount > 0 ? (
        <span className="sidebar-notification-badge inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm shadow-black/20">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
      {!mobile ? <span className="sidebar-notification-tooltip"><span>Notificações</span></span> : null}
    </button>
  );

  return (
    <div className={["relative", className].join(" ")} ref={menuRef}>
      {button}
      {open ? (
        <div
          className={[
            "z-[170] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[color:var(--border-strong)] bg-[var(--modal-bg)] shadow-[var(--toast-shadow)]",
            mobile
              ? "absolute bottom-[calc(100%+10px)] left-0"
              : "fixed bottom-4 left-[calc(var(--sidebar-width)+12px)]"
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificações</p>
              <p className="mt-0.5 text-xs text-[color:var(--text-soft)]">
                {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                aria-label="Marcar todas como lidas"
                className="grid size-8 place-items-center rounded-md text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
                onClick={() => void markAllRead()}
                title="Marcar todas como lidas"
                type="button"
              >
                <CheckCheck className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 border-b border-[color:var(--border)] p-1">
            {[
              [true, "Não lidas"],
              [false, "Todas"]
            ].map(([value, label]) => (
              <button
                className={[
                  "h-9 rounded text-xs transition-colors",
                  showUnread === value
                    ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)]"
                    : "text-[color:var(--text-muted)]"
                ].join(" ")}
                key={label as string}
                onClick={() => setShowUnread(value as boolean)}
                type="button"
              >
                {label as string}
              </button>
            ))}
          </div>
          <div className="max-h-80 divide-y divide-[color:var(--border)] overflow-y-auto">
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => (
                <Link
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover-bg)]"
                  href="/notifications"
                  key={item.id}
                  onClick={() => setOpen(false)}
                >
                  <StatusPulse className="mt-1" tone={notificationTone(item.type)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <strong className="truncate text-sm font-medium">{item.title}</strong>
                      <span className="shrink-0 text-[10px] text-[color:var(--text-faint)]">
                        {relativeTime(item.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[color:var(--text-soft)]">
                      {item.message}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-[color:var(--text-soft)]">
                Nada por aqui.
              </p>
            )}
          </div>
          <Link
            className="flex h-11 items-center justify-between border-t border-[color:var(--border)] px-4 text-sm text-[color:var(--text-muted)] hover:bg-[var(--hover-bg)]"
            href="/notifications"
            onClick={() => setOpen(false)}
          >
            Ver todas
            <ChevronRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
