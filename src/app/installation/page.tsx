import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell";
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

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-4 text-xs leading-6 text-[color:var(--app-text-strong)]">
      <code>{children}</code>
    </pre>
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
        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">01</p>
            <h2 className="mt-2 font-semibold">Código e Git</h2>
          </div>
          <div className="max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Faça um fork para sua conta, clone o repositório e instale as dependências com npm.
            </p>
            <CodeBlock>{`git clone URL_DO_REPOSITORIO
cd worklog
npm install
cp .env.example .env.local`}</CodeBlock>
            <p className="mt-4">
              Para publicar sua cópia em outro repositório, altere o remote e envie a branch
              principal.
            </p>
            <CodeBlock>{`git remote set-url origin URL_DO_SEU_REPOSITORIO
git push -u origin main`}</CodeBlock>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">02</p>
            <h2 className="mt-2 font-semibold">Supabase</h2>
          </div>
          <div className="max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Crie um projeto e copie as strings de conexão em Database Settings. Use o
              Transaction Pooler em `DATABASE_URL` para o runtime serverless. Use uma conexão
              direta compatível ou o Session Pooler em `DIRECT_URL` para migrations.
            </p>
            <CodeBlock>{`DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."`}</CodeBlock>
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
          <div className="max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Gere o Prisma Client e aplique as migrations versionadas no banco configurado.
            </p>
            <CodeBlock>{`npm run prisma:generate
npm run prisma:deploy`}</CodeBlock>
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
          <div className="max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Crie uma conta, instale o plugin oficial no editor e copie sua API Key para o
              backend do WorkLog.
            </p>
            <CodeBlock>{`WAKATIME_API_KEY="sua_chave_secreta"`}</CodeBlock>
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
            <CodeBlock>{`npm run dev`}</CodeBlock>
          </div>
        </section>

        <section className="grid gap-6 py-8 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div>
            <p className="text-xs text-[color:var(--text-faint)]">05</p>
            <h2 className="mt-2 font-semibold">Vercel</h2>
          </div>
          <div className="max-w-3xl text-sm leading-6 text-[color:var(--text-soft)]">
            <p>
              Importe o repositório GitHub na Vercel e adicione as três variáveis nos ambientes
              Production e Preview. Faça um novo deploy sempre que alterar variáveis.
            </p>
            <CodeBlock>{`WAKATIME_API_KEY=
DATABASE_URL=
DIRECT_URL=`}</CodeBlock>
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
