import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  GitBranch,
  type LucideIcon
} from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { AppShell } from "@/components/app-shell";
import { creatorProfile } from "@/content/site";
import { getServerEnvStatus } from "@/lib/env";

export const metadata: Metadata = {
  description:
    "Conheça a história do WorkLog, uma plataforma criada para transformar tempo dedicado em valor visível através da integração com WakaTime, gestão de projetos, clientes e pagamentos.",
  title: "Sobre | WorkLog"
};

const capabilities = [
  "Horas reais importadas do WakaTime",
  "Horas dedicadas registradas manualmente",
  "Projetos e clientes",
  "Pagamentos recebidos",
  "Valores pendentes",
  "Histórico completo de operações",
  "Compartilhamento de projetos",
  "Dashboard financeira"
];

const profileLinks: Array<{
  href: string;
  icon: LucideIcon | typeof FaGithub;
  label: string;
}> = [
  {
    href: creatorProfile.githubUrl,
    icon: FaGithub,
    label: "GitHub"
  },
  {
    href: creatorProfile.linkedinUrl,
    icon: FaLinkedin,
    label: "LinkedIn"
  },
  {
    href: creatorProfile.instagramUrl,
    icon: FaInstagram,
    label: "Instagram"
  }
];

export default function AboutPage() {
  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Sobre</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
          Tempo real, valor visível
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          Por que o WorkLog existe, qual problema ele resolve e como começar a usar.
        </p>
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
          <div className="mt-4 grid w-full max-w-[220px] gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {profileLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  className="inline-flex h-10 items-center justify-between gap-2 rounded-md border border-[color:var(--border)] px-3 text-sm text-[color:var(--text-muted)] transition-colors hover:border-[color:var(--border-strong)] hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  href={item.href}
                  key={item.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <ExternalLink className="size-3" />
                </a>
              );
            })}
          </div>
        </aside>

        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold">A história</h2>
          <div className="mt-5 space-y-5 text-sm leading-7 text-[color:var(--text-muted)]">
            <p>O WorkLog nasceu de uma dificuldade simples:</p>
            <p className="text-base font-medium text-[color:var(--app-text-strong)]">
              Entender quanto tempo realmente é investido em um projeto.
            </p>
            <p>
              Muitas horas não acontecem apenas escrevendo código. Pesquisa, planejamento,
              resolução de problemas, testes, ajustes, reuniões, documentação e tomada de
              decisões também consomem tempo e geram valor.
            </p>
            <p>
              Mesmo assim, normalmente apenas o resultado final fica visível para o cliente. Foi
              justamente dessa necessidade que surgiu o WorkLog: mostrar não apenas quanto tempo
              foi codado, mas também quanto tempo foi dedicado ao projeto como um todo.
            </p>
            <p>
              Com a integração ao WakaTime, é possível acompanhar as horas reais de programação.
              Com os registros manuais, é possível contabilizar todo o restante do trabalho que
              normalmente não aparece.
            </p>
            <p>
              O resultado é uma visão muito mais justa do esforço investido em cada projeto. Além
              disso, horas codadas e horas dedicadas podem possuir valores independentes, para que
              cada profissional decida exatamente como deseja precificar seu trabalho.
            </p>
            <p className="text-base font-medium text-[color:var(--app-text-strong)]">
              A ideia é simples: transformar tempo invisível em valor visível.
            </p>
            <p>
              Mais do que controlar horas, o objetivo é ajudar desenvolvedores, freelancers e
              profissionais independentes a entender melhor seus projetos, melhorar sua
              precificação e demonstrar com clareza o valor real que entregam aos clientes.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--border)] py-7">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Visão completa
          </p>
          <h2 className="mt-2 text-lg font-semibold">O que você consegue controlar</h2>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability) => (
            <article
              className="flex items-center gap-2.5 rounded-md border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2.5"
              key={capability}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded bg-emerald-500/10 text-emerald-400">
                <Check className="size-3" strokeWidth={2.2} />
              </span>
              <p className="text-sm leading-5 text-[color:var(--text-muted)]">{capability}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-8">
        <div className="about-cta border border-emerald-500/20 bg-[var(--surface)] px-5 py-7 sm:px-7 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-400">
                Open source
              </p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                Use o WorkLog no seu próprio fluxo
              </h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                O projeto é open source e pode ser clonado, estudado e adaptado para o seu jeito de
                trabalhar. Configure seu ambiente, conecte o WakaTime e acompanhe horas, pagamentos
                e a evolução dos seus projetos com mais clareza.
              </p>
            </div>
            <Link
              className="button-primary inline-flex h-11 w-fit shrink-0 items-center gap-2 px-4 text-sm font-medium"
              href="/installation"
              prefetch
            >
              Ver como instalar
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5 border-t border-[color:var(--border)] py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            <GitBranch className="size-4" />
            Projeto Open Source
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
            O WorkLog está disponível publicamente no GitHub. Você pode estudar o código, adaptar
            para seu fluxo de trabalho e evoluir a plataforma da forma que desejar.
          </p>
        </div>
        <a
          className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-md border border-[color:var(--border-strong)] px-3 text-sm font-medium text-[color:var(--app-text-strong)] transition-colors hover:bg-[var(--hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          href={creatorProfile.repositoryUrl}
          rel="noreferrer"
          target="_blank"
        >
          <FaGithub className="size-4" />
          Ver repositório
          <ExternalLink className="size-3.5" />
        </a>
      </section>
    </AppShell>
  );
}
