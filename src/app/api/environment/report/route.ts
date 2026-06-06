import { NextResponse } from "next/server";
import {
  NotificationCategory,
  NotificationType
} from "@prisma/client";
import { getServerEnvStatus } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const status = getServerEnvStatus();
  const invalidKeys = Object.entries(status.keys)
    .filter(([, check]) => check.label !== "ok")
    .map(([key]) => key);

  if (invalidKeys.length === 0) {
    return NextResponse.json({ ok: true, reported: false });
  }

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.notification.findFirst({
      select: {
        id: true
      },
      where: {
        createdAt: {
          gte: since
        },
        type: NotificationType.ENV_WARNING
      }
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          category: NotificationCategory.IMPORTANT,
          message: `Revise ${invalidKeys.join(", ")} no ambiente do servidor.`,
          title: "Configuração de ambiente pendente",
          type: NotificationType.ENV_WARNING
        }
      });
    }

    return NextResponse.json({ ok: true, reported: !existing });
  } catch {
    return NextResponse.json({ ok: true, reported: false });
  }
}
