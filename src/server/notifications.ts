import {
  NotificationCategory,
  NotificationType
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotificationInput = {
  category?: NotificationCategory;
  message: string;
  projectId?: string | null;
  shareLinkId?: string | null;
  title: string;
  type: NotificationType;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      category: input.category ?? NotificationCategory.IMPORTANT,
      message: input.message,
      projectId: input.projectId ?? null,
      shareLinkId: input.shareLinkId ?? null,
      title: input.title,
      type: input.type
    }
  });
}

export async function createNotificationSafely(input: NotificationInput) {
  try {
    await createNotification(input);
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error && typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.name
          : "unknown";

    console.error(`[notifications] create failed (${code})`);
  }
}
