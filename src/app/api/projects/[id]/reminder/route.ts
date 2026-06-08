import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, ReminderAmountMode, ReminderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";

export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseAmount(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

// Brazil no longer observes DST, so America/Sao_Paulo is a stable UTC-3. We build
// the exact instant from the user's local date + time without pulling a TZ lib.
function parseDueDate(dateValue: unknown, timeValue: unknown) {
  if (typeof dateValue !== "string" || !dateValue.trim()) {
    return null;
  }

  const time =
    typeof timeValue === "string" && /^\d{2}:\d{2}$/.test(timeValue.trim())
      ? timeValue.trim()
      : "09:00";
  const date = new Date(`${dateValue}T${time}:00-03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const amountMode =
      body.amountMode === "FIXED" ? ReminderAmountMode.FIXED : ReminderAmountMode.PENDING;
    const dueDate = parseDueDate(body.dueDate, body.dueTime);
    const message = optionalText(body.message);
    const fixedAmount =
      amountMode === ReminderAmountMode.FIXED ? parseAmount(body.fixedAmount) : null;

    if (!dueDate) {
      return NextResponse.json(
        {
          error: "Informe a data do lembrete.",
          ok: false
        },
        { status: 400 }
      );
    }

    if (
      amountMode === ReminderAmountMode.FIXED &&
      (fixedAmount === null || Number.isNaN(fixedAmount) || fixedAmount <= 0)
    ) {
      return NextResponse.json(
        {
          error: "Informe um valor fixo maior que zero para o lembrete.",
          ok: false
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      select: { clientId: true, id: true },
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Projeto não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    // Re-arm the due notification whenever the reminder is saved so a fresh
    // notification can fire for the updated date.
    const data = {
      amountMode,
      clientId: project.clientId,
      dueDate,
      fixedAmount,
      message,
      notifiedDueAt: null,
      status: ReminderStatus.ACTIVE
    };

    await prisma.paymentReminder.upsert({
      create: {
        ...data,
        projectId: id
      },
      update: data,
      where: {
        projectId: id
      }
    });

    revalidatePath("/projects", "page");
    revalidatePath("/payments", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("payment reminder upsert", error);

    return NextResponse.json(
      {
        error: "Não foi possível salvar o lembrete de pagamento.",
        ok: false
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.paymentReminder.deleteMany({ where: { projectId: id } });
    revalidatePath("/projects", "page");
    revalidatePath("/payments", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("payment reminder delete", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        error: "Não foi possível remover o lembrete de pagamento.",
        ok: false
      },
      { status: 500 }
    );
  }
}
