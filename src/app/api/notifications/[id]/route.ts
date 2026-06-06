import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.notification.update({
      data: {
        readAt: new Date()
      },
      where: {
        id
      }
    });
    revalidatePath("/notifications", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"
        ? 404
        : 500;

    return NextResponse.json(
      {
        error:
          status === 404
            ? "Notificação não encontrada."
            : "Não foi possível atualizar a notificação.",
        ok: false
      },
      { status }
    );
  }
}
