import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  NotificationCategory,
  NotificationType,
  Prisma
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/prisma-error";

export const runtime = "nodejs";

function slugBase(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function revalidateSharedProject(slugs: string[]) {
  for (const slug of slugs) {
    revalidatePath(`/share/${slug}`, "page");
    revalidatePath(`/share/${slug}/opengraph-image`);
    revalidatePath(`/share/${slug}/pdf`);
  }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      select: {
        id: true,
        name: true,
        shareLinks: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            active: true,
            id: true,
            slug: true
          },
          take: 1
        }
      },
      where: {
        id
      }
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

    const current = project.shareLinks[0];

    if (current?.active) {
      return NextResponse.json({
        ok: true,
        path: `/share/${current.slug}`
      });
    }

    const slug = current?.slug ??
      `${slugBase(project.name) || "projeto"}-${randomBytes(5).toString("hex")}`;

    const link = current
      ? await prisma.shareLink.update({
          data: {
            active: true
          },
          where: {
            id: current.id
          }
        })
      : await prisma.shareLink.create({
          data: {
            projectId: project.id,
            slug
          }
        });

    await prisma.notification.create({
        data: {
          category: NotificationCategory.IMPORTANT,
          message: `Um link somente leitura foi criado para ${project.name}.`,
          projectId: project.id,
          shareLinkId: link.id,
          title: "Novo link compartilhado",
          type: NotificationType.SHARE_CREATED
        }
      });

    revalidatePath("/", "page");
    revalidatePath("/projects", "page");
    revalidatePath("/notifications", "page");

    return NextResponse.json({
      ok: true,
      path: `/share/${slug}`
    });
  } catch (error) {
    logPrismaError("share link create", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o link compartilhável.",
        ok: false
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const permanent = new URL(request.url).searchParams.get("permanent") === "1";

    if (permanent) {
      const links = await prisma.shareLink.findMany({
        select: {
          slug: true
        },
        where: {
          projectId: id
        }
      });

      if (links.length === 0) {
        return NextResponse.json(
          {
            error: "Nenhum link encontrado para este projeto.",
            ok: false
          },
          { status: 404 }
        );
      }

      const result = await prisma.shareLink.deleteMany({
        where: {
          projectId: id
        }
      });

      revalidatePath("/", "page");
      revalidatePath("/projects", "page");
      revalidatePath("/notifications", "page");
      revalidateSharedProject(links.map((link) => link.slug));

      return NextResponse.json({ ok: true, removed: result.count });
    }

    const links = await prisma.shareLink.findMany({
      select: {
        slug: true
      },
      where: {
        active: true,
        projectId: id
      }
    });

    if (links.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum link ativo encontrado para este projeto.",
          ok: false
        },
        { status: 404 }
      );
    }

    const result = await prisma.shareLink.updateMany({
      data: {
        active: false
      },
      where: {
        active: true,
        projectId: id
      }
    });

    revalidatePath("/", "page");
    revalidatePath("/projects", "page");
    revalidateSharedProject(links.map((link) => link.slug));

    return NextResponse.json({ ok: true, disabled: result.count });
  } catch (error) {
    logPrismaError("share link disable", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Projeto não encontrado.",
          ok: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Não foi possível desativar o link compartilhável.",
        ok: false
      },
      { status: 500 }
    );
  }
}
