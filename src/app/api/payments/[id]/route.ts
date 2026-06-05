import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.payment.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível remover o pagamento.",
        ok: false
      },
      { status: 500 }
    );
  }
}
