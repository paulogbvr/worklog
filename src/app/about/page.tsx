import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { AppShell } from "@/components/app-shell";
import { creatorProfile } from "@/content/site";
import { getServerEnvStatus } from "@/lib/env";

export default function AboutPage() {
  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Sobre</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
          Tempo real, valor visível
        </h1>
      </header>

      <section className="grid gap-8 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside>
          <Image
            alt={`Foto de ${creatorProfile.name}`}
            className="aspect-square w-full max-w-[220px] rounded-lg border border-[color:var(--border)] object-cover object-[32%_center]"
            height={460}
            priority
            src={creatorProfile.image}
            width={460}
          />
          <p className="mt-4 text-lg font-semibold">{creatorProfile.name}</p>
          <p className="mt-1 text-sm text-[color:var(--text-soft)]">Criador do WorkLog</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
              href={creatorProfile.githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              <FaGithub className="size-4" />
              GitHub
              <ExternalLink className="size-3" />
            </a>
            {creatorProfile.instagramUrl ? (
              <a
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
                href={creatorProfile.instagramUrl}
                rel="noreferrer"
                target="_blank"
              >
                <FaInstagram className="size-4" />
                Instagram
                <ExternalLink className="size-3" />
              </a>
            ) : null}
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)]"
              href={creatorProfile.linkedinUrl}
              rel="noreferrer"
              target="_blank"
            >
              <FaLinkedin className="size-4" />
              LinkedIn
              <ExternalLink className="size-3" />
            </a>
          </div>
        </aside>

        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold">A história</h2>
          <div className="mt-5 space-y-5 text-sm leading-7 text-[color:var(--text-muted)]">
            <p>
              O WorkLog nasceu da dificuldade de entender quanto tempo realmente é investido em um
              projeto.
            </p>
            <p>
              Muitas horas não acontecem apenas escrevendo código. Pesquisa, planejamento,
              resolução de problemas, testes, ajustes, reuniões e decisões também consomem tempo
              e geram valor. Ainda assim, é comum que apenas o resultado final fique visível.
            </p>
            <p>
              O WorkLog registra tanto as horas codadas quanto as horas dedicadas e permite cobrar
              cada fonte de forma independente ou conjunta. Assim, desenvolvedores, freelancers e
              outros profissionais conseguem enxergar o esforço real, melhorar a precificação e
              acompanhar a rentabilidade de cada projeto ao longo do tempo.
            </p>
            <p className="font-medium text-[color:var(--app-text-strong)]">
              A ideia é simples: dar mais controle sobre o trabalho e tornar mais justa a relação
              entre tempo dedicado, valor gerado e remuneração.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
