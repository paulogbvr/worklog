import { prisma } from "@/lib/prisma";

const PROFILE_ID = "default";

export type ProfileData = {
  name: string | null;
};

// Reads the singleton profile. Resilient: if the table/connection is unavailable
// it falls back to an empty profile so the dashboard greeting still renders.
export async function getProfile(): Promise<ProfileData> {
  try {
    const profile = await prisma.profile.findUnique({
      select: { name: true },
      where: { id: PROFILE_ID }
    });

    return { name: profile?.name ?? null };
  } catch {
    return { name: null };
  }
}

export async function saveProfileName(name: string | null): Promise<ProfileData> {
  const profile = await prisma.profile.upsert({
    create: { id: PROFILE_ID, name },
    select: { name: true },
    update: { name },
    where: { id: PROFILE_ID }
  });

  return { name: profile.name ?? null };
}
