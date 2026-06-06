import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { NotificationCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        orderBy: {
          createdAt: "desc"
        },
        select: {
          createdAt: true,
          id: true,
          message: true,
          projectId: true,
          readAt: true,
          title: true,
          type: true
        },
        take: 8,
        where: {
          category: NotificationCategory.IMPORTANT
        }
      }),
      prisma.notification.count({
        where: {
          category: NotificationCategory.IMPORTANT,
          readAt: null
        }
      })
    ]);

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString() ?? null
      })),
      ok: true,
      unreadCount
    });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível carregar as notificações.",
        ok: false
      },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    await prisma.notification.updateMany({
      data: {
        readAt: new Date()
      },
      where: {
        category: NotificationCategory.IMPORTANT,
        readAt: null
      }
    });
    revalidatePath("/notifications", "page");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível marcar as notificações como lidas.",
        ok: false
      },
      { status: 500 }
    );
  }
}
