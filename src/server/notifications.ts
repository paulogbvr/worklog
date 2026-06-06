import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotificationInput = {
  message: string;
  projectId?: string | null;
  title: string;
  type: NotificationType;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      message: input.message,
      projectId: input.projectId ?? null,
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
