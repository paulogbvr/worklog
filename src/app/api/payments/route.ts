import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const projectId = optionalText(body.projectId);
    const amount = Number(body.amount);
    const paidAt = typeof body.paidAt === "string" ? new Date(`${body.paidAt}T12:00:00.000Z`) : null;

    if (!projectId || !Number.isFinite(amount) || amount <= 0 || !paidAt || Number.isNaN(paidAt.getTime())) {
      return NextResponse.json(
        {
          error: "Informe projeto, valor e data válidos.",
          ok: false
        },
        { status: 400 }
      );
    }

    await prisma.payment.create({
      data: {
        amount,
        note: optionalText(body.note),
        paidAt,
        projectId
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível registrar o pagamento.",
        ok: false
      },
      { status: 500 }
    );
  }
}
