import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = optionalText(body.name);

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe o nome do cliente.",
          ok: false
        },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        email: optionalText(body.email),
        name,
        notes: optionalText(body.notes),
        phone: optionalText(body.phone)
      }
    });

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name
      },
      ok: true
    });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível criar o cliente.",
        ok: false
      },
      { status: 500 }
    );
  }
}
