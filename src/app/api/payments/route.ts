import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readPaymentInput } from "@/server/payments/validation";
import {
  deletePaymentReceiptSafely,
  preparePaymentReceipt
} from "@/server/storage/payment-receipts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let uploadedPath: string | null = null;

  try {
    const input = await readPaymentInput(request);
    const receipt = input.receipt
      ? await preparePaymentReceipt(input.receipt, input.projectId)
      : null;
    uploadedPath = receipt?.path ?? null;

    await prisma.payment.create({
      data: {
        amount: input.amount,
        method: input.method,
        note: input.note,
        paidAt: input.paidAt,
        projectId: input.projectId,
        receiptData: receipt?.data,
        receiptMimeType: receipt?.mimeType,
        receiptName: receipt?.name,
        receiptPath: receipt?.path,
        receiptSize: receipt?.size
      }
    });
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
        error.message.startsWith("Não foi possível enviar") ||
        error.message.startsWith("O comprovante") ||
        error.message.startsWith("Comprovantes"));
    const isMissingProject =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";

    return NextResponse.json(
      {
        error: isValidationError
          ? error.message
          : isMissingProject
            ? "O projeto selecionado não foi encontrado."
            : "Não foi possível registrar o pagamento.",
        ok: false
      },
      { status: isValidationError || isMissingProject ? 400 : 500 }
    );
  }
}
