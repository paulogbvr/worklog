import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProfile, saveProfileName } from "@/server/profile";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o perfil.", ok: false },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { name?: unknown };
    const rawName = typeof body.name === "string" ? body.name.trim() : "";

    if (rawName.length > 80) {
      return NextResponse.json(
        { error: "O nome deve ter no máximo 80 caracteres.", ok: false },
        { status: 400 }
      );
    }

    const profile = await saveProfileName(rawName ? rawName : null);
    revalidatePath("/", "page");
    revalidatePath("/profile", "page");

    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível salvar o perfil.", ok: false },
      { status: 500 }
    );
  }
}
