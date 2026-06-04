import { getServerEnvStatus } from "@/lib/env";
import Link from "next/link";

const metrics = [
  { label: "Horas WakaTime", value: "0h", detail: "Aguardando sincronizacao" },
  { label: "Horas Dedicadas", value: "0h", detail: "Nenhum registro manual" },
  { label: "Valor Recebido", value: "R$ 0,00", detail: "Sem pagamentos" },
  { label: "Valor Pendente", value: "R$ 0,00", detail: "Sem projetos configurados" }
];

const workflow = [
  "WakaTime",
  "Sincronizacao",
  "Projetos",
  "Registros",
  "Pagamentos"
];

export default function Home() {
  const envStatus = getServerEnvStatus();

  return (
    <main className="min-h-screen bg-[#090b0f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-white/10 bg-white/[0.03] px-6 py-6 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-white text-sm font-semibold text-[#090b0f]">
              WL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">WorkLog</p>
              <p className="text-xs text-white/52">MVP pessoal</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1 text-sm text-white/58">
            <Link className="block rounded-md bg-white/10 px-3 py-2 text-white" href="/">
              Dashboard
            </Link>
            <span className="block px-3 py-2">Projetos</span>
            <span className="block px-3 py-2">Clientes</span>
            <span className="block px-3 py-2">Registros</span>
            <span className="block px-3 py-2">Pagamentos</span>
          </nav>

          <div className="mt-10 rounded-lg border border-white/10 bg-[#10141b] p-4">
            <p className="text-xs uppercase text-white/42">Ambiente</p>
            <p className="mt-2 text-sm font-medium">
              {envStatus.configured ? "Variaveis configuradas" : "Variaveis pendentes"}
            </p>
            <div className="mt-4 space-y-2">
              {Object.entries(envStatus.keys).map(([key, configured]) => (
                <div className="flex items-center justify-between text-xs" key={key}>
                  <span className="text-white/52">{key}</span>
                  <span className={configured ? "text-emerald-300" : "text-amber-300"}>
                    {configured ? "ok" : "pendente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-cyan-200/80">Fundacao do produto</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Tempo, valor recebido e saldo pendente em um painel direto.
              </h1>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/64">
              Ultima sincronizacao
              <strong className="mt-1 block text-white">Nao realizada</strong>
            </div>
          </header>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20"
                key={metric.label}
              >
                <p className="text-sm text-white/52">{metric.label}</p>
                <p className="mt-4 text-3xl font-semibold tracking-normal">{metric.value}</p>
                <p className="mt-2 text-sm text-white/45">{metric.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-lg border border-white/10 bg-[#10141b] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Fluxo principal</h2>
                  <p className="mt-1 text-sm text-white/48">Dados reais entram pelo backend.</p>
                </div>
                <span className="rounded-full border border-cyan-200/20 px-3 py-1 text-xs text-cyan-100">
                  M1
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-5">
                {workflow.map((item, index) => (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                    key={item}
                  >
                    <p className="text-xs text-white/35">0{index + 1}</p>
                    <p className="mt-3 text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#10141b] p-5">
              <h2 className="text-lg font-semibold">Proxima etapa</h2>
              <p className="mt-3 text-sm leading-6 text-white/56">
                Conectar Prisma ao Supabase e criar o schema inicial para clientes,
                projetos, registros, pagamentos e sincronizacoes.
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[25%] rounded-full bg-cyan-200" />
              </div>
              <p className="mt-3 text-xs text-white/42">Fundacao em andamento</p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
