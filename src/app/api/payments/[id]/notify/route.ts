import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.payment.update({
      data: {
        whatsappNotifiedAt: new Date()
      },
      where: {
        id
      }
    });
    revalidatePath("/", "page");
    revalidatePath("/payments", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const isMissingRecord =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

    return NextResponse.json(
      {
        error: isMissingRecord
          ? "Pagamento não encontrado."
          : "Não foi possível registrar o envio.",
        ok: false
      },
      { status: isMissingRecord ? 404 : 500 }
    );
  }
}
