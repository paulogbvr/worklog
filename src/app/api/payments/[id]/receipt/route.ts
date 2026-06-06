import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentReceiptBytes } from "@/server/storage/payment-receipts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeDownloadName(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(-120) || "comprovante"
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payment = await prisma.payment.findUnique({
      select: {
        receiptData: true,
        receiptMimeType: true,
        receiptName: true,
        receiptPath: true
      },
      where: {
        id
      }
    });

    if (!payment || (!payment.receiptPath && !payment.receiptData)) {
      return NextResponse.json(
        {
          error: "Comprovante não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    const file = await getPaymentReceiptBytes({
      data: payment.receiptData,
      path: payment.receiptPath
    });
    const download = new URL(request.url).searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const originalName = payment.receiptName ?? "comprovante";
    const name = safeDownloadName(originalName);
    const encodedName = encodeURIComponent(originalName).replace(/['()]/g, escape);

    return new NextResponse(Buffer.from(file), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${disposition}; filename="${name}"; filename*=UTF-8''${encodedName}`,
        "Content-Type": payment.receiptMimeType ?? "application/octet-stream"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o comprovante.",
        ok: false
      },
      { status: 500 }
    );
  }
}
