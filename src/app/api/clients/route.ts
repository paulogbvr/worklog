import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import { parseClientInput } from "@/server/clients/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseClientInput(body);

    if (!parsed.ok) {
      return NextResponse.json(
        {
          error: parsed.error,
          ok: false
        },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: parsed.data
    });
    revalidatePath("/", "page");
    revalidatePath("/clients", "page");
    revalidatePath("/projects", "page");

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name
      },
      ok: true
    });
  } catch (error) {
    logPrismaError("client create", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "CPF/CNPJ já cadastrado para outro cliente.",
          ok: false
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível criar o cliente.",
        ok: false
      },
      { status: 500 }
    );
  }
}
