# TASK_PLAN

Roadmap de implementacao do WorkLog.

Objetivo:

```txt
Saber quanto tempo foi trabalhado,
quanto isso vale,
quanto ja foi pago,
e quanto ainda falta receber.
```

---

# Estado Atual

Documentacao base concluida.

Ambiente real configurado:

- `DATABASE_URL`
- `WAKATIME_API_KEY`

Aplicacao inicializada:

- `package.json`
- `package-lock.json`
- Next.js
- TypeScript
- TailwindCSS
- scripts `lint`, `typecheck` e `build`
- `src/app`
- `src/lib/env.ts`
- deploy inicial em `https://worklog-projects.vercel.app/`
- favicon e metadata social configurados
- imagem de preview social em `public/og-image.png`

Ainda pendente:

- `prisma/schema.prisma`
- migrations
- integracao WakaTime real

---

# M0 — Alinhamento Documental

Status:

```txt
Concluido
```

Entregaveis:

- `AGENTS.md` como instrucao oficial do Codex
- `CLAUDE.md` mantido apenas como ponte legada
- `DATA_MODEL.md` criado
- `WAKATIME_SYNC.md` criado
- roadmap transformado neste arquivo

---

# M1 — Fundacao Next.js

Status:

```txt
Concluido
```

Objetivo:

Criar a base tecnica do projeto.

Entregaveis:

- Next.js
- TypeScript
- TailwindCSS
- estrutura inicial de `src/`
- scripts `lint`, `typecheck` e `build`
- validacao inicial de variaveis de ambiente

Criterio de aceite:

- app abre localmente
- comandos de validacao existem
- nenhum segredo exposto no frontend

---

# M2 — Prisma e Banco

Status:

```txt
Pendente
```

Objetivo:

Criar o schema inicial e conectar ao Supabase PostgreSQL.

Entregaveis:

- `prisma/schema.prisma`
- Prisma Client
- primeira migration
- models do MVP

Criterio de aceite:

- `npx prisma generate` executa com sucesso
- migration aplica no banco Supabase
- schema segue `docs/architecture/DATA_MODEL.md`

---

# M3 — Sincronizacao WakaTime Manual

Status:

```txt
Pendente
```

Objetivo:

Trazer projetos e horas reais do WakaTime.

Entregaveis:

- cliente server-side WakaTime
- route handler de sincronizacao
- criacao automatica de projetos
- persistencia de horas por projeto e dia
- `SyncLog`

Criterio de aceite:

- projetos reais aparecem no banco
- projeto novo nasce ativo e pendente de configuracao
- erro de API nao derruba o dashboard

---

# M4 — Dashboard Real

Status:

```txt
Pendente
```

Objetivo:

Exibir resumo operacional e financeiro usando dados reais.

Entregaveis:

- horas WakaTime
- horas dedicadas
- diferenca entre horas
- valor total
- valor recebido
- valor pendente
- projetos pendentes
- ultima sincronizacao

Criterio de aceite:

- dashboard funciona com banco vazio
- dashboard funciona apos sincronizacao real
- valores financeiros usam horas dedicadas

---

# M5 — Projetos, Clientes e Registros

Status:

```txt
Pendente
```

Objetivo:

Permitir configurar projetos e registrar trabalho manual.

Entregaveis:

- cadastro e edicao de clientes
- configuracao de cliente e valor/hora em projetos
- CRUD de registros de trabalho
- suporte a registros atravessando meia-noite
- recalculo de duracao

Criterio de aceite:

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

Entregaveis:

- cadastro de pagamento
- historico por projeto
- valor recebido
- saldo pendente

Criterio de aceite:

- pagamento reduz valor pendente
- historico aparece no dashboard e no projeto

---

# M7 — Portal Compartilhavel

Status:

```txt
Pendente
```

Objetivo:

Criar visualizacao publica somente leitura para clientes.

Entregaveis:

- `/share/{slug}`
- dados do projeto
- horas
- valores
- historico de pagamentos
- ultima atualizacao

Criterio de aceite:

- portal nao permite edicao
- slug e unico
- link pode ser desativado

---

# M8 — Visual Premium e Deploy

Status:

```txt
Pendente
```

Objetivo:

Polir a experiencia e publicar a primeira versao.

Entregaveis:

- microinteracoes suaves
- dashboard responsivo
- favicon e preview social
- build validado
- variaveis configuradas na Vercel
- protecao administrativa antes de deploy publico

Deploy inicial ja disponivel:

```txt
https://worklog-projects.vercel.app/
```

Criterio de aceite:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- deploy acessivel sem expor segredos

---

# Backlog Futuro

- relatorios PDF
- exportacao financeira
- filtros avancados por periodo
- multiusuario
- permissoes
- workspaces

---

# Regra de Atualizacao

Ao concluir uma etapa:

1. atualizar status neste arquivo
2. atualizar `docs/project-memory/PROGRESS.md`
3. atualizar `README.md`
4. registrar novas decisoes em `DECISIONS.md` quando necessario
