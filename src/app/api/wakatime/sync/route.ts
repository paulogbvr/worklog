import { NextResponse } from "next/server";
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
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível sincronizar o WakaTime agora.";
}

export async function POST() {
  try {
    const result = await syncWakaTime();

    return NextResponse.json({
      ok: true,
      result
    });
  } catch (error) {
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
