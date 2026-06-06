import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock3,
  Code2,
  ExternalLink,
  History,
  ReceiptText,
  ShieldCheck
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SharedProjectActions } from "@/app/share/[slug]/shared-project-actions";
import { getPublicProject, recordShareAccess } from "@/server/sharing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = "https://worklog-projects.vercel.app";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  if (!project) {
    return {
      title: "Projeto não encontrado | WorkLog"
    };
  }

  const title = `${project.name} | WorkLog`;
  const description = `${project.clientName}: ${project.description}`;
  const url = `${siteUrl}/share/${slug}`;
  const image = `${url}/opengraph-image`;

  return {
    alternates: {
      canonical: url
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: `Acompanhamento do projeto ${project.name}`,
          height: 630,
          url: image,
          width: 1200
        }
      ],
      siteName: "WorkLog",
      title,
      type: "website",
      url
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image],
      title
    }
  };
}

export default async function SharedProjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  if (!project) {
    notFound();
  }

  await recordShareAccess({
    projectId: project.projectId,
    projectName: project.name,
    shareLinkId: project.id
  });

  const metrics = [
    ["Horas WakaTime", project.wakaTimeLabel],
    ["Horas dedicadas", project.dedicatedLabel],
    ["Valor gerado", project.generatedValueLabel],
    ["Valor recebido", project.receivedValueLabel],
    ["Valor pendente", project.pendingValueLabel]
  ];

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[color:var(--app-text)]">
      <div className="pointer-events-none fixed inset-0 bg-[var(--ambient-gradient)]" />
      <div className="relative mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 lg:py-10">
        <header className="border-b border-[color:var(--border)] pb-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BrandLogo />
            <SharedProjectActions slug={slug} />
          </div>

          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-[color:var(--text-muted)]">
                Acompanhamento compartilhado
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-[color:var(--app-text-strong)]">
                {project.name}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--text-soft)]">
                {project.clientName}
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-xs text-emerald-400">
              <ShieldCheck className="size-4" />
              {project.statusLabel} · somente leitura
            </div>
          </div>
        </header>

        <section className="grid gap-3 py-7 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([label, value]) => (
            <article
              className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-4"
              key={label}
            >
              <p className="text-xs text-[color:var(--text-soft)]">{label}</p>
              <p className="mt-3 text-xl font-semibold">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 border-y border-[color:var(--border)] py-7 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-blue-500/10 text-blue-400">
              <Code2 className="size-5" />
            </span>
            <div>
              <h2 className="font-medium">Última atualização</h2>
              <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                {project.lastSyncLabel}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-amber-500/10 text-amber-400">
              <Clock3 className="size-5" />
            </span>
            <div>
              <h2 className="font-medium">Observações do projeto</h2>
              <p className="mt-1 text-sm leading-6 text-[color:var(--text-soft)]">
                {project.description}
              </p>
            </div>
          </div>
          {project.repositoryUrl ? (
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <ExternalLink className="size-5" />
              </span>
              <div>
                <h2 className="font-medium">Repositório do projeto</h2>
                <Link
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-[color:var(--text-muted)] underline underline-offset-4"
                  href={project.repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Abrir repositório
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        <section className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <ReceiptText className="size-5 text-[color:var(--text-muted)]" />
              <h2 className="text-lg font-semibold">Histórico de pagamentos</h2>
            </div>
            <div className="mt-4 divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
              {project.payments.length > 0 ? (
                project.payments.map((payment) => (
                  <article
                    className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
                    key={payment.id}
                  >
                    <div>
                      <p className="text-[color:var(--text-muted)]">
                        {payment.note ?? "Pagamento recebido"}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--text-faint)]">
                        {payment.dateLabel} · {payment.methodLabel}
                      </p>
                    </div>
                    <strong>{payment.amountLabel}</strong>
                  </article>
                ))
              ) : (
                <p className="py-8 text-sm text-[color:var(--text-soft)]">
                  Nenhum pagamento registrado até o momento.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <History className="size-5 text-[color:var(--text-muted)]" />
              <h2 className="text-lg font-semibold">Histórico de atualizações</h2>
            </div>
            <div className="mt-4 space-y-0 border-y border-[color:var(--border)]">
              {project.timeline.length > 0 ? (
                project.timeline.map((item) => (
                  <article
                    className="border-b border-[color:var(--border)] py-4 last:border-0"
                    key={item.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <span className="shrink-0 text-[10px] text-[color:var(--text-faint)]">
                        {item.dateLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[color:var(--text-soft)]">
                      {item.detail}
                    </p>
                  </article>
                ))
              ) : (
                <p className="py-8 text-sm text-[color:var(--text-soft)]">
                  Nenhuma atualização disponível.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
