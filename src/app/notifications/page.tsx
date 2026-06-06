import { Bell, BellRing } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  NotificationsCenter,
  type NotificationCenterItem
} from "@/components/notifications-center";
import { getServerEnvStatus } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { NotificationCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const TIME_ZONE = "America/Sao_Paulo";

function toneForType(type: string): NotificationCenterItem["tone"] {
  if (type === "SYNC_ERROR" || type === "ENV_WARNING") {
    return "error";
  }

  if (type === "SYNC_SUCCESS" || type === "SHARE_CREATED") {
    return "success";
  }

  return "neutral";
}

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });
  const items = notifications.map<NotificationCenterItem & { category: NotificationCategory }>((notification) => ({
    category: notification.category,
    createdAtLabel: new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: TIME_ZONE
    }).format(notification.createdAt),
    id: notification.id,
    message: notification.message,
    read: Boolean(notification.readAt),
    title: notification.title,
    tone: toneForType(notification.type)
  }));
  const importantItems = items.filter(
    (item) => item.category === NotificationCategory.IMPORTANT
  );
  const updateItems = items.filter(
    (item) => item.category === NotificationCategory.UPDATE
  );
  const unreadCount = importantItems.filter((item) => !item.read).length;

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Notificações</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Atividade recente</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Sincronizações, compartilhamentos e acessos aos projetos públicos.
        </p>
      </header>

      <section className="flex flex-wrap gap-8 border-b border-[color:var(--border)] py-6">
        <div className="flex items-center gap-3">
          <BellRing className="size-5 text-emerald-400" />
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">Não lidas</p>
            <p className="mt-1 text-xl font-semibold">{unreadCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-[color:var(--text-muted)]" />
          <div>
            <p className="text-xs text-[color:var(--text-soft)]">Total recente</p>
            <p className="mt-1 text-xl font-semibold">{notifications.length}</p>
          </div>
        </div>
      </section>

      <NotificationsCenter
        description="Acessos, compartilhamentos, falhas e alertas que merecem sua atenção."
        initialItems={importantItems}
        title="Importantes"
      />
      <NotificationsCenter
        defaultMode="all"
        description="Sincronizações concluídas e movimentações operacionais normais."
        initialItems={updateItems}
        showReadControls={false}
        title="Atualizações"
      />
    </AppShell>
  );
}
