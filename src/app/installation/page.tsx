import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { AppShell } from "@/components/app-shell";
import { InstallationCodeBlock } from "@/components/installation-code-block";
import { creatorProfile } from "@/content/site";
import { getServerEnvStatus } from "@/lib/env";

const links = {
  nextDeploy: "https://nextjs.org/docs/app/getting-started/deploying",
  prisma: "https://www.prisma.io/docs",
  supabase: "https://supabase.com/",
  supabaseConnection: "https://supabase.com/docs/guides/database/connecting-to-postgres",
  supabasePrisma: "https://supabase.com/docs/guides/database/prisma",
  vercel: "https://vercel.com/",
  wakatime: "https://wakatime.com/",
  wakatimeApi: "https://wakatime.com/developers",
  wakatimeCursor: "https://wakatime.com/cursor",
  wakatimeKey: "https://wakatime.com/api-key",
  wakatimeFaq: "https://wakatime.com/faq",
  wakatimePlugins: "https://wakatime.com/plugins",
  wakatimeVsCode: "https://wakatime.com/vs-code-plugin",
  wakatimeWindsurf: "https://wakatime.com/plugins/windsurf/installing",
  wakatimeZed: "https://wakatime.com/plugins/zed/installing"
};

function DocsLink({ children, href }: { children: string; href: string }) {
  return (
    <a
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--app-text-strong)] underline decoration-[color:var(--border-strong)] underline-offset-4 transition-colors hover:decoration-current"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

export default function InstallationPage() {
  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">Instalação</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">
          Configure sua própria instância
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
          O WorkLog roda com Next.js, Supabase PostgreSQL, Prisma, WakaTime e Vercel.
        </p>
      </header>

      <div className="divide-y divide-[color:var(--border)]">
        <section className="py-8">
          <div className="flex flex-col gap-5 rounded-lg border border-[color:var(--border-strong)] bg-[var(--surface-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
                Repositório oficial
              </p>
              <h2 className="mt-2 text-lg font-semibold">paulogbvr/worklog</h2>
              <p className="mt-2 text-sm text-[color:var(--text-soft)]">
                Código-fonte, histórico de versões e instruções atualizadas.
              </p>
            </div>
            <a
              className="button-primary inline-flex h-11 w-fit items-center gap-2 px-4 text-sm font-medium"
              href={creatorProfile.repositoryUrl}
              rel="noreferrer"
              target="_blank"
            >
              <FaGithub className="size-4" />
              Abrir no GitHub
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">01</p>
            <h2 className="mt-2 font-semibold">Código e Git</h2>
          </div>
          <div className="min-w-0 max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Faça um fork para sua conta, clone o repositório e instale as dependências com npm.
            </p>
            <InstallationCodeBlock>{`git clone https://github.com/paulogbvr/worklog
cd worklog
npm install
cp .env.example .env.local`}</InstallationCodeBlock>
            <p className="mt-4">
              Para publicar sua cópia em outro repositório, altere o remote e envie a branch
              principal.
            </p>
            <InstallationCodeBlock>{`git remote set-url origin https://github.com/paulogbvr/worklog
git push -u origin main`}</InstallationCodeBlock>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">02</p>
            <h2 className="mt-2 font-semibold">Supabase</h2>
          </div>
          <div className="min-w-0 max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Crie um projeto e copie as strings de conexão em Database Settings. Use o
              Transaction Pooler em `DATABASE_URL` para o runtime serverless. Use uma conexão
              direta compatível ou o Session Pooler em `DIRECT_URL` para migrations.
            </p>
            <InstallationCodeBlock>{`DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."`}</InstallationCodeBlock>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
              <DocsLink href={links.supabase}>Supabase</DocsLink>
              <DocsLink href={links.supabaseConnection}>Conexões PostgreSQL</DocsLink>
              <DocsLink href={links.supabasePrisma}>Supabase com Prisma</DocsLink>
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">03</p>
            <h2 className="mt-2 font-semibold">Prisma</h2>
          </div>
          <div className="min-w-0 max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Gere o Prisma Client e aplique as migrations versionadas no banco configurado.
            </p>
            <InstallationCodeBlock>{`npm run prisma:generate
npm run prisma:deploy`}</InstallationCodeBlock>
            <div className="mt-4">
              <DocsLink href={links.prisma}>Documentação Prisma</DocsLink>
            </div>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">04</p>
            <h2 className="mt-2 font-semibold">WakaTime</h2>
          </div>
          <div className="min-w-0 max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Crie uma conta, instale o plugin oficial no editor e copie sua API Key para o
              backend do WorkLog.
            </p>
            <InstallationCodeBlock>{`WAKATIME_API_KEY="sua_chave_secreta"`}</InstallationCodeBlock>
            <p className="mt-4">
              No VS Code, Cursor e Windsurf, abra o comando de instalação de extensões, procure
              por `wakatime` e informe a API Key quando solicitado. No Zed, procure por `wakatime`
              na página de extensões. Outros editores estão no catálogo oficial.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
              <DocsLink href={links.wakatime}>WakaTime</DocsLink>
              <DocsLink href={links.wakatimeVsCode}>VS Code</DocsLink>
              <DocsLink href={links.wakatimeCursor}>Cursor</DocsLink>
              <DocsLink href={links.wakatimeWindsurf}>Windsurf</DocsLink>
              <DocsLink href={links.wakatimeZed}>Zed</DocsLink>
              <DocsLink href={links.wakatimePlugins}>Outros editores</DocsLink>
              <DocsLink href={links.wakatimeKey}>API Key</DocsLink>
              <DocsLink href={links.wakatimeApi}>API Docs</DocsLink>
              <DocsLink href={links.wakatimeFaq}>FAQ</DocsLink>
            </div>
            <p className="mt-4">
              Inicie o app, abra o dashboard e use “Atualizar agora” para criar os projetos e
              importar as primeiras horas.
            </p>
            <InstallationCodeBlock>{`npm run dev`}</InstallationCodeBlock>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">05</p>
            <h2 className="mt-2 font-semibold">Vercel</h2>
          </div>
          <div className="min-w-0 max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Importe o repositório GitHub na Vercel e adicione as três variáveis nos ambientes
              Production e Preview. Faça um novo deploy sempre que alterar variáveis.
            </p>
            <InstallationCodeBlock>{`WAKATIME_API_KEY=
DATABASE_URL=
DIRECT_URL=`}</InstallationCodeBlock>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
              <DocsLink href={links.vercel}>Vercel</DocsLink>
              <DocsLink href={links.nextDeploy}>Deploy de Next.js</DocsLink>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
