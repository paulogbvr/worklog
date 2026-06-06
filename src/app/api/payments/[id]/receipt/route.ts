import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadPaymentReceipt } from "@/server/storage/payment-receipts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeDownloadName(name: string) {
  return name.replace(/["\r\n]/g, "");
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payment = await prisma.payment.findUnique({
      select: {
        receiptMimeType: true,
        receiptName: true,
        receiptPath: true
      },
      where: {
        id
      }
    });

    if (!payment?.receiptPath) {
      return NextResponse.json(
        {
          error: "Comprovante não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    const file = await downloadPaymentReceipt(payment.receiptPath);
    const download = new URL(request.url).searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const name = safeDownloadName(payment.receiptName ?? "comprovante");

    return new NextResponse(await file.arrayBuffer(), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${disposition}; filename="${name}"`,
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
