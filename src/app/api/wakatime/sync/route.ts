import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  NotificationCategory,
  NotificationType
} from "@prisma/client";
import { createNotificationSafely } from "@/server/notifications";
import { WakaTimeApiError } from "@/server/wakatime/client";
import { syncWakaTime } from "@/server/wakatime/sync";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStatusCode(error: unknown) {
  if (error instanceof WakaTimeApiError && error.status) {
    if (error.status === 401 || error.status === 403) {
      return 401;
    }

    if (error.status === 429) {
      return 429;
    }
  }

  return 500;
}

function getPublicErrorMessage(error: unknown) {
  if (error instanceof WakaTimeApiError) {
    if (error.status === 401 || error.status === 403) {
      return "A chave do WakaTime não foi aceita.";
    }

    if (error.status === 429) {
      return "O WakaTime limitou temporariamente as requisições. Tente novamente em instantes.";
    }

    return "O WakaTime não respondeu como esperado.";
  }

  return "Não foi possível sincronizar o WakaTime agora.";
}

export async function POST() {
  try {
    const result = await syncWakaTime();
    await createNotificationSafely({
      category: NotificationCategory.UPDATE,
      message: `${result.projectsFound} projetos e ${result.daysSynced} registros diários foram atualizados.`,
      title: "Sincronização concluída",
      type: NotificationType.SYNC_SUCCESS
    });
    revalidatePath("/", "page");
    revalidatePath("/notifications", "page");
    revalidatePath("/projects", "page");
    revalidatePath("/records", "page");

    return NextResponse.json(
      {
        ok: true,
        result
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    await createNotificationSafely({
      category: NotificationCategory.IMPORTANT,
      message: getPublicErrorMessage(error),
      title: "Erro de sincronização",
      type: NotificationType.SYNC_ERROR
    });
    revalidatePath("/notifications", "page");

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error),
        ok: false
      },
      {
        status: getStatusCode(error)
      }
    );
  }
}
