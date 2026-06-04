# TASK_PLAN

Roadmap de implementação do WorkLog.

Objetivo:

```txt
Saber quanto tempo foi trabalhado,
quanto isso vale,
quanto já foi pago,
e quanto ainda falta receber.
```

---

# Estado Atual

Documentação base concluída.

Ambiente real configurado:

- `DATABASE_URL`
- `WAKATIME_API_KEY`

Aplicação inicializada:

- `package.json`
- `package-lock.json`
- Next.js
- TypeScript
- TailwindCSS
- scripts `lint`, `typecheck` e `build`
- `src/app`
- `src/components/app-shell.tsx`
- `src/lib/env.ts`
- deploy inicial em `https://worklog-projects.vercel.app/`
- favicon monochrome minimalista em `public/favicon.ico`
- metadata social configurada com imagem Open Graph absoluta
- imagem de preview social monochrome versionada em `public/og-worklog-v3.png`
- navegação desktop/mobile refinada sem logo visual no app
- acentuação PT-BR revisada nos textos visíveis do app
- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/lib/prisma.ts`
- migration inicial em `prisma/migrations/20260604231000_init/migration.sql`
- scripts `prisma:validate`, `prisma:generate`, `prisma:migrate` e `prisma:deploy`

Ainda pendente:

- aplicar migration no Supabase via `DIRECT_URL`/pooler
- integração WakaTime real

---

# M0 — Alinhamento Documental

Status:

```txt
Concluído
```

Entregáveis:

- `AGENTS.md` como instrução oficial do Codex
- `CLAUDE.md` mantido apenas como ponte legada
- `DATA_MODEL.md` criado
- `WAKATIME_SYNC.md` criado
- roadmap transformado neste arquivo

---

# M1 — Fundação Next.js

Status:

```txt
Concluído
```

Objetivo:

Criar a base técnica do projeto.

Entregáveis:

- Next.js
- TypeScript
- TailwindCSS
- estrutura inicial de `src/`
- shell visual com sidebar desktop e drawer mobile
- scripts `lint`, `typecheck` e `build`
- validação inicial de variáveis de ambiente

Critério de aceite:

- app abre localmente
- comandos de validação existem
- nenhum segredo exposto no frontend

---

# M2 — Prisma e Banco

Status:

```txt
Parcialmente concluído
```

Objetivo:

Criar o schema inicial e conectar ao Supabase PostgreSQL.

Entregáveis:

- `prisma/schema.prisma` criado
- Prisma Client gerado
- primeira migration criada
- models do MVP criados
- `prisma.config.ts` carregando `.env.local`
- scripts Prisma criados

Critério de aceite:

- `npx prisma generate` executa com sucesso: concluído
- schema segue `docs/architecture/DATA_MODEL.md`: concluído
- migration aplica no banco Supabase: pendente por conexão `DATABASE_URL` direta IPv6-only

Bloqueio atual:

O endpoint direto do Supabase (`db.<project-ref>.supabase.co:5432`) resolve apenas para IPv6 neste ambiente e retorna `P1001` no Prisma. Para concluir a aplicação remota, configurar `DIRECT_URL` com a Session Pooler do Supabase ou usar a Direct Connection em um ambiente com IPv6.

---

# M3 — Sincronização WakaTime Manual

Status:

```txt
Pendente
```

Objetivo:

Trazer projetos e horas reais do WakaTime.

Entregáveis:

- cliente server-side WakaTime
- route handler de sincronização
- criação automática de projetos
- persistencia de horas por projeto e dia
- `SyncLog`

Critério de aceite:

- projetos reais aparecem no banco
- projeto novo nasce ativo e pendente de configuração
- erro de API não derruba o dashboard

---

# M4 — Dashboard Real

Status:

```txt
Pendente
```

Objetivo:

Exibir resumo operacional e financeiro usando dados reais.

Entregáveis:

- horas WakaTime
- horas dedicadas
- diferenca entre horas
- valor total
- valor recebido
- valor pendente
- projetos pendentes
- última sincronização

Critério de aceite:

- dashboard funciona com banco vazio
- dashboard funciona após sincronização real
- valores financeiros usam horas dedicadas

---

# M5 — Projetos, Clientes e Registros

Status:

```txt
Pendente
```

Objetivo:

Permitir configurar projetos e registrar trabalho manual.

Entregáveis:

- cadastro e edicao de clientes
- configuração de cliente e valor/hora em projetos
- CRUD de registros de trabalho
- suporte a registros atravessando meia-noite
- recálculo de duração

Critério de aceite:

- projeto pendente pode virar configurado
- registros alteram horas dedicadas
- valor total recalcula corretamente

---

# M6 — Pagamentos

Status:

```txt
Pendente
```

Objetivo:

Controlar recebimentos por projeto.

Entregáveis:

- cadastro de pagamento
- histórico por projeto
- valor recebido
- saldo pendente

Critério de aceite:

- pagamento reduz valor pendente
- histórico aparece no dashboard e no projeto

---

# M7 — Portal Compartilhavel

Status:

```txt
Pendente
```

Objetivo:

Criar visualização pública somente leitura para clientes.

Entregáveis:

- `/share/{slug}`
- dados do projeto
- horas
- valores
- histórico de pagamentos
- última atualização

Critério de aceite:

- portal não permite edição
- slug é único
- link pode ser desativado

---

# M8 — Visual Premium e Deploy

Status:

```txt
Pendente
```

Objetivo:

Polir a experiência e publicar a primeira versão.

Entregáveis:

- microinterações suaves
- dashboard responsivo
- favicon e preview social versionado
- build validado
- variáveis configuradas na Vercel
- proteção administrativa antes de deploy público

Deploy inicial já disponível:

```txt
https://worklog-projects.vercel.app/
```

Critério de aceite:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- deploy acessível sem expor segredos

---

# Backlog Futuro

- relatórios PDF
- exportação financeira
- filtros avancados por periodo
- multiusuário
- permissões
- workspaces

---

# Regra de Atualização

Ao concluir uma etapa:

1. atualizar status neste arquivo
2. atualizar `docs/project-memory/PROGRESS.md`
3. atualizar `README.md`
4. registrar novas decisões em `DECISIONS.md` quando necessário
