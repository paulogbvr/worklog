import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Code2, ExternalLink, ReceiptText } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { StatusPulse } from "@/components/status-pulse";
import { SharedPaymentReceipt } from "@/app/share/[slug]/shared-payment-receipt";
import { SharedPaymentInvoice } from "@/app/share/[slug]/shared-payment-invoice";
import { SharedProjectActions } from "@/app/share/[slug]/shared-project-actions";
import {
  SharedProjectTimeline,
  type SharedTimelineFilter
} from "@/app/share/[slug]/shared-project-timeline";
import { getPublicProject, recordShareAccess } from "@/server/sharing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = "https://worklog-projects.vercel.app";

function parseTimelineFilter(
  value: string | string[] | undefined
): SharedTimelineFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filter === "payments" || filter === "updates" ? filter : "all";
}

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
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
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
    [
      project.billingMode === "FIXED" ? "Preço fechado" : "Valor gerado",
      project.generatedValueLabel
    ],
    ["Valor recebido", project.receivedValueLabel],
    [project.pendingIsCredit ? "Excedente" : "Valor pendente", project.pendingValueLabel]
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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-[color:var(--text-muted)]">
                  Acompanhamento compartilhado
                </p>
                <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[var(--surface-subtle)] px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--text-soft)]">
                  somente leitura
                </span>
              </div>
              <h1 className="mt-1 text-3xl font-semibold text-[color:var(--app-text-strong)]">
                {project.name}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--text-soft)]">
                {project.clientName}
              </p>
            </div>
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs ${project.statusBadgeClass}`}
            >
              <StatusPulse tone={project.statusTone} />
              {project.statusLabel}
            </div>
          </div>
        </header>

        <section className="py-7">
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[var(--surface)] sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map(([label, value]) => (
              <div
                className="border-b border-r border-[color:var(--border)] p-4 last:border-r-0 sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(5n)]:border-r-0"
                key={label}
              >
                <p className="truncate text-[11px] uppercase tracking-wide text-[color:var(--text-faint)]">
                  {label}
                </p>
                <p className="mt-1.5 text-lg font-semibold sm:text-xl">{value}</p>
              </div>
            ))}
          </div>
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
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <ReceiptText className="size-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-amber-400">Histórico de pagamentos</h2>
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
                      {payment.hasReceipt ? (
                        <SharedPaymentReceipt
                          isImage={payment.receiptIsImage}
                          paymentId={payment.id}
                          projectName={project.name}
                        />
                      ) : null}
                      {payment.hasInvoice || payment.invoiceKey ? (
                        <SharedPaymentInvoice
                          hasFile={payment.hasInvoice}
                          invoiceKey={payment.invoiceKey}
                          isImage={payment.invoiceIsImage}
                          isViewable={payment.invoiceIsViewable}
                          paymentId={payment.id}
                          projectName={project.name}
                        />
                      ) : null}
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

          <SharedProjectTimeline
            initialFilter={parseTimelineFilter(query.filter)}
            items={project.timeline}
          />
        </section>
      </div>
    </main>
  );
}
