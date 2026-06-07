import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentInvoiceBytes } from "@/server/storage/payment-invoices";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeDownloadName(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(-120) || "nota-fiscal"
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
        invoiceData: true,
        invoiceMimeType: true,
        invoiceName: true,
        invoicePath: true
      },
      where: {
        id
      }
    });

    if (!payment || (!payment.invoicePath && !payment.invoiceData)) {
      return NextResponse.json(
        {
          error: "Nota fiscal não encontrada.",
          ok: false
        },
        { status: 404 }
      );
    }

    const file = await getPaymentInvoiceBytes({
      data: payment.invoiceData,
      path: payment.invoicePath
    });
    const download = new URL(request.url).searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const originalName = payment.invoiceName ?? "nota-fiscal";
    const name = safeDownloadName(originalName);
    const encodedName = encodeURIComponent(originalName).replace(/['()]/g, escape);

    return new NextResponse(Buffer.from(file), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${disposition}; filename="${name}"; filename*=UTF-8''${encodedName}`,
        "Content-Type": payment.invoiceMimeType ?? "application/octet-stream"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a nota fiscal.",
        ok: false
      },
      { status: 500 }
    );
  }
}
