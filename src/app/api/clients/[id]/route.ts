import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, ProjectConfigurationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";
import { parseClientInput } from "@/server/clients/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    await prisma.client.update({
      data: parsed.data,
      where: {
        id
      }
    });
    revalidatePath("/", "page");
    revalidatePath("/clients", "page");
    revalidatePath("/projects", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("client update", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "CPF/CNPJ já cadastrado para outro cliente.",
          ok: false
        },
        { status: 409 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Cliente não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível salvar o cliente.",
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

    await prisma.$transaction([
      prisma.project.updateMany({
        data: {
          configurationStatus: ProjectConfigurationStatus.PENDING
        },
        where: {
          clientId: id
        }
      }),
      prisma.client.delete({
        where: {
          id
        }
      })
    ]);
    revalidatePath("/", "page");
    revalidatePath("/clients", "page");
    revalidatePath("/projects", "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    logPrismaError("client delete", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Cliente não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível remover o cliente.",
        ok: false
      },
      { status: 500 }
    );
  }
}
