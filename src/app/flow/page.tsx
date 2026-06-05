import {
  BarChart3,
  Clock3,
  CreditCard,
  FolderKanban,
  RefreshCw,
  Waves
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getServerEnvStatus } from "@/lib/env";

const flowSteps = [
  {
    detail: "O editor registra o tempo de código sem exigir um cronômetro manual.",
    icon: Waves,
    label: "WakaTime"
  },
  {
    detail: "A sincronização importa projetos atuais e horas agregadas por dia.",
    icon: RefreshCw,
    label: "Sincronização"
  },
  {
    detail: "Projetos aparecem automaticamente e recebem regras próprias de cobrança.",
    icon: FolderKanban,
    label: "Projetos"
  },
  {
    detail: "Reuniões, pesquisa, suporte e planejamento entram como horas dedicadas.",
    icon: Clock3,
    label: "Registros"
  },
  {
    detail: "Recebimentos ficam vinculados ao projeto e reduzem o saldo pendente.",
    icon: CreditCard,
    label: "Pagamentos"
  },
  {
    detail: "Horas, valores gerados, recebidos e pendentes formam uma visão única.",
    icon: BarChart3,
    label: "Dashboard"
  }
];

export default function FlowPage() {
  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Fluxo</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
          Do tempo registrado ao valor pendente
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
          O WorkLog conecta somente as etapas necessárias para entender esforço, cobrança e
          recebimento.
        </p>
      </header>

      <section className="py-8">
        <div className="relative max-w-3xl">
          <div className="absolute bottom-8 left-5 top-8 w-px bg-[var(--border)]" />
          {flowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-5 py-5"
                key={step.label}
              >
                <span className="relative z-10 grid size-10 place-items-center rounded-md border border-[color:var(--border-strong)] bg-[var(--surface)]">
                  <Icon className="size-4 text-[color:var(--app-text-strong)]" />
                </span>
                <div className="border-b border-[color:var(--border)] pb-5">
                  <p className="text-xs text-[color:var(--text-faint)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 text-base font-semibold">{step.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                    {step.detail}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
