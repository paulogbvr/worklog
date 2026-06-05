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
- migration `20260604231000_init` aplicada no Supabase
- cliente WakaTime server-side em `src/server/wakatime/client.ts`
- sincronização manual em `src/server/wakatime/sync.ts`
- rota `POST /api/wakatime/sync`
- botão `Atualizar agora`
- dashboard inicial lendo resumo real do banco
- sidebar com estado persistido em `localStorage`
- alternância dark/light mode persistida em `localStorage`
- listagem inicial de projetos sincronizados no dashboard

Ainda pendente:

- configuração de cliente e valor/hora em projetos sincronizados
- registros de trabalho
- pagamentos
- portal compartilhável

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
Concluído
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
- migration aplica no banco Supabase: concluído

Resultado:

`npm run prisma:deploy` aplicou a migration `20260604231000_init` com sucesso no Supabase.

---

# M3 — Sincronização WakaTime Manual

Status:

```txt
Concluído
```

Objetivo:

Trazer projetos e horas reais do WakaTime.

Entregáveis:

- cliente server-side WakaTime
- route handler de sincronização
- criação automática de projetos
- persistencia de horas por projeto e dia
- `SyncLog`
- botão manual `Atualizar agora`

Critério de aceite:

- projetos reais aparecem no banco: concluído
- projeto novo nasce ativo e pendente de configuração: concluído
- erro de API não derruba o dashboard: concluído

Validação real:

```txt
6 projetos encontrados
6 projetos criados
15 registros diários sincronizados
84954 segundos importados
```

---

# M4 — Dashboard Real

Status:

```txt
Em andamento
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
- botão manual de sincronização
- listagem inicial de projetos sincronizados
- destaque para projetos pendentes de configuração
- dark/light mode no shell
- persistência de estado da sidebar

Critério de aceite:

- dashboard funciona com banco vazio
- dashboard funciona após sincronização real
- valores financeiros usam horas dedicadas
- sidebar mantém estado após atualizar a página
- tema mantém estado após atualizar a página

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
