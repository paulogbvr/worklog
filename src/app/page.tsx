import { AppShell } from "@/components/app-shell";
import { getServerEnvStatus } from "@/lib/env";

const metrics = [
  { label: "Horas WakaTime", value: "0h", detail: "Aguardando sincronizacao" },
  { label: "Horas Dedicadas", value: "0h", detail: "Nenhum registro manual" },
  { label: "Valor Recebido", value: "R$ 0,00", detail: "Sem pagamentos" },
  { label: "Valor Pendente", value: "R$ 0,00", detail: "Sem projetos configurados" }
];

const workflow = [
  {
    id: "projetos",
    label: "Projetos",
    detail: "Projetos reais detectados pelo WakaTime e configurados no WorkLog."
  },
  {
    id: "clientes",
    label: "Clientes",
    detail: "Cliente e valor por hora definidos sem virar um CRM."
  },
  {
    id: "registros",
    label: "Registros",
    detail: "Horas dedicadas ajustadas manualmente quando necessario."
  },
  {
    id: "pagamentos",
    label: "Pagamentos",
    detail: "Recebimentos vinculados ao projeto para calcular saldo pendente."
  }
];

export default function Home() {
  const envStatus = getServerEnvStatus();

  return (
    <AppShell envStatus={envStatus}>
      <header
        className="flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between"
        id="dashboard"
      >
        <div>
          <p className="text-sm text-white/54">Dashboard</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Tempo trabalhado, valor recebido e saldo pendente em um painel direto.
          </h1>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/64">
          Ultima sincronizacao
          <strong className="mt-1 block text-white">Nao realizada</strong>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20"
            key={metric.label}
          >
            <p className="text-sm text-white/52">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-normal">{metric.value}</p>
            <p className="mt-2 text-sm text-white/45">{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-white/10 bg-[#111111]/92 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Fluxo principal</h2>
              <p className="mt-1 text-sm text-white/48">Dados reais entram pelo backend.</p>
            </div>
            <span className="rounded-full border border-white/[0.12] px-3 py-1 text-xs text-white/58">
              Base
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            {workflow.map((item, index) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                id={item.id}
                key={item.label}
              >
                <p className="text-xs text-white/35">0{index + 1}</p>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-2 text-sm leading-5 text-white/42">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#111111]/92 p-5">
          <h2 className="text-lg font-semibold">Proxima etapa</h2>
          <p className="mt-3 text-sm leading-6 text-white/56">
            Conectar Prisma ao Supabase e criar o schema inicial para clientes, projetos,
            registros, pagamentos e sincronizacoes.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[25%] rounded-full bg-white/70" />
          </div>
          <p className="mt-3 text-xs text-white/42">Banco e sincronizacao real</p>
        </section>
      </div>
    </AppShell>
  );
}
