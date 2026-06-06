import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ShareEventType } from "@prisma/client";
import { getPublicProject, recordShareEvent } from "@/server/sharing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function wrapText(text: string, maxCharacters = 82) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxCharacters && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const project = await getPublicProject(slug);

  if (!project) {
    return NextResponse.json(
      {
        error: "Link compartilhável não encontrado.",
        ok: false
      },
      { status: 404 }
    );
  }

  const document = await PDFDocument.create();
  const page = document.addPage([595.28, 841.89]);
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0.05, 0.05, 0.05);
  const muted = rgb(0.38, 0.4, 0.43);
  const green = rgb(0.05, 0.52, 0.36);
  let y = 786;

  page.drawText("WorkLog", {
    color: black,
    font: bold,
    size: 17,
    x: 42,
    y
  });
  page.drawText("Acompanhamento compartilhado", {
    color: muted,
    font: regular,
    size: 9,
    x: 42,
    y: y - 20
  });
  y -= 66;
  page.drawText(project.name, {
    color: black,
    font: bold,
    size: 25,
    x: 42,
    y
  });
  page.drawText(`${project.clientName} | ${project.statusLabel}`, {
    color: green,
    font: regular,
    size: 10,
    x: 42,
    y: y - 22
  });
  y -= 65;

  const metrics = [
    ["WakaTime", project.wakaTimeLabel],
    ["Horas dedicadas", project.dedicatedLabel],
    ["Valor gerado", project.generatedValueLabel],
    ["Valor recebido", project.receivedValueLabel],
    ["Valor pendente", project.pendingValueLabel]
  ];

  for (const [label, value] of metrics) {
    page.drawText(label, {
      color: muted,
      font: regular,
      size: 9,
      x: 42,
      y
    });
    page.drawText(value, {
      color: black,
      font: bold,
      size: 13,
      x: 200,
      y: y - 2
    });
    y -= 29;
  }

  y -= 16;
  page.drawLine({
    color: rgb(0.86, 0.87, 0.88),
    end: { x: 553, y },
    start: { x: 42, y },
    thickness: 1
  });
  y -= 28;
  page.drawText("Observacoes", {
    color: black,
    font: bold,
    size: 13,
    x: 42,
    y
  });
  y -= 21;

  for (const line of wrapText(project.description)) {
    page.drawText(line, {
      color: muted,
      font: regular,
      size: 9,
      x: 42,
      y
    });
    y -= 14;
  }

  y -= 20;
  page.drawText("Historico de pagamentos", {
    color: black,
    font: bold,
    size: 13,
    x: 42,
    y
  });
  y -= 24;

  if (project.payments.length === 0) {
    page.drawText("Nenhum pagamento registrado.", {
      color: muted,
      font: regular,
      size: 9,
      x: 42,
      y
    });
  } else {
    for (const payment of project.payments.slice(0, 12)) {
      page.drawText(payment.dateLabel, {
        color: muted,
        font: regular,
        size: 8,
        x: 42,
        y
      });
      page.drawText(`${payment.amountLabel} | ${payment.methodLabel}`, {
        color: black,
        font: bold,
        size: 9,
        x: 190,
        y
      });
      y -= 20;
    }
  }

  page.drawText(
    `Gerado pelo backend do WorkLog em ${new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(new Date())}`,
    {
      color: muted,
      font: regular,
      size: 7,
      x: 42,
      y: 32
    }
  );

  await recordShareEvent(
    {
      projectId: project.projectId,
      projectName: project.name,
      shareLinkId: project.id
    },
    ShareEventType.PDF_DOWNLOAD
  );

  const bytes = await document.save();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="worklog-${cleanFileName(project.name) || "projeto"}.pdf"`,
      "Content-Type": "application/pdf"
    }
  });
}
