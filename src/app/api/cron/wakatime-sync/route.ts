import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { NotificationCategory, NotificationType } from "@prisma/client";
import { createNotificationSafely } from "@/server/notifications";
import { syncWakaTime } from "@/server/wakatime/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Scheduled WakaTime sync (Vercel Cron). The schedule lives in vercel.json.
// Protected by CRON_SECRET: Vercel Cron sends `Authorization: Bearer <secret>`
// automatically when the env var is set, so the route is admin-only and never
// exposes the WakaTime API key. The manual button keeps using POST /api/wakatime/sync.
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  // When no secret is configured we refuse to run, so the endpoint is never
  // left publicly triggerable by accident.
  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado.", ok: false }, { status: 401 });
  }

  try {
    const result = await syncWakaTime();
    await createNotificationSafely({
      category: NotificationCategory.UPDATE,
      message: `Sincronização automática: ${result.projectsFound} projetos e ${result.daysSynced} registros diários atualizados.`,
      title: "Sincronização automática concluída",
      type: NotificationType.SYNC_SUCCESS
    });
    revalidatePath("/", "page");
    revalidatePath("/notifications", "page");
    revalidatePath("/projects", "page");
    revalidatePath("/records", "page");

    return NextResponse.json(
      { ok: true, result },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    await createNotificationSafely({
      category: NotificationCategory.IMPORTANT,
      message: "A sincronização automática do WakaTime falhou. Tente o botão manual.",
      title: "Erro na sincronização automática",
      type: NotificationType.SYNC_ERROR
    });

    return NextResponse.json(
      { error: "Não foi possível sincronizar automaticamente.", ok: false },
      { status: 500 }
    );
  }
}
