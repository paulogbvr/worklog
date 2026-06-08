import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { getServerEnvStatus } from "@/lib/env";
import { getProfile } from "@/server/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Perfil</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Conta e preferências</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Configure seu nome e como o WorkLog se refere a você.
        </p>
      </header>

      <section className="py-6">
        <ProfileForm initialName={profile.name} />
      </section>
    </AppShell>
  );
}
