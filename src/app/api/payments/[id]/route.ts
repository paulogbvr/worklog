import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readPaymentInput } from "@/server/payments/validation";
import {
  deletePaymentReceiptSafely,
  uploadPaymentReceipt
} from "@/server/storage/payment-receipts";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let uploadedPath: string | null = null;

  try {
    const { id } = await context.params;
    const [input, current] = await Promise.all([
      readPaymentInput(request),
      prisma.payment.findUnique({
        select: {
          receiptPath: true
        },
        where: {
          id
        }
      })
    ]);

    if (!current) {
      return NextResponse.json(
        {
          error: "Pagamento não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    const receipt = input.receipt
      ? await uploadPaymentReceipt(input.receipt, input.projectId)
      : null;
    uploadedPath = receipt?.path ?? null;

    await prisma.payment.update({
      data: {
        amount: input.amount,
        method: input.method,
        note: input.note,
        paidAt: input.paidAt,
        projectId: input.projectId,
        ...(receipt
          ? {
              receiptMimeType: receipt.mimeType,
              receiptName: receipt.name,
              receiptPath: receipt.path
            }
          : input.removeReceipt
            ? {
                receiptMimeType: null,
                receiptName: null,
                receiptPath: null
              }
            : {})
      },
      where: {
        id
      }
    });

    if (receipt || input.removeReceipt) {
      await deletePaymentReceiptSafely(current.receiptPath);
    }

    revalidatePath("/", "page");
    revalidatePath("/payments", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    await deletePaymentReceiptSafely(uploadedPath);
    const isValidationError =
      error instanceof Error &&
      (error.message.startsWith("Selecione") ||
        error.message.startsWith("Informe") ||
        error.message.startsWith("Envie") ||
        error.message.startsWith("O comprovante") ||
        error.message.startsWith("Comprovantes"));
    const isMissingRecord =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

    return NextResponse.json(
      {
        error: isValidationError
          ? error.message
          : isMissingRecord
            ? "Pagamento não encontrado."
            : "Não foi possível atualizar o pagamento.",
        ok: false
      },
      { status: isValidationError ? 400 : isMissingRecord ? 404 : 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const payment = await prisma.payment.delete({
      select: {
        receiptPath: true
      },
      where: {
        id
      }
    });
    await deletePaymentReceiptSafely(payment.receiptPath);
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
          : "Não foi possível remover o pagamento.",
        ok: false
      },
      { status: isMissingRecord ? 404 : 500 }
    );
  }
}
