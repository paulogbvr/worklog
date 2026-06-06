import Link from "next/link";
import { notFound } from "next/navigation";
import { Code2, ExternalLink, ReceiptText, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getPublicProject, recordShareAccess } from "@/server/sharing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="flex flex-col gap-6 border-b border-[color:var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <BrandLogo />
            <p className="mt-8 text-sm text-[color:var(--text-muted)]">
              Acompanhamento compartilhado
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[color:var(--app-text-strong)]">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-[color:var(--text-soft)]">{project.clientName}</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-xs text-emerald-400">
            <ShieldCheck className="size-4" />
            Somente leitura
          </div>
        </header>

        <section className="grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-5">
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

        <section className="py-8">
          <div className="flex items-center gap-3">
            <ReceiptText className="size-5 text-[color:var(--text-muted)]" />
            <h2 className="text-lg font-semibold">Histórico de pagamentos</h2>
          </div>
          <div className="mt-4 divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
            {project.payments.length > 0 ? (
              project.payments.map((payment) => (
                <article
                  className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  key={payment.id}
                >
                  <p className="text-[color:var(--text-muted)]">
                    {payment.note ?? "Pagamento recebido"}
                  </p>
                  <span className="text-[color:var(--text-soft)]">{payment.dateLabel}</span>
                  <strong>{payment.amountLabel}</strong>
                </article>
              ))
            ) : (
              <p className="py-8 text-sm text-[color:var(--text-soft)]">
                Nenhum pagamento registrado até o momento.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
