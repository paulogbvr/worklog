# WORKLOG

Sistema para acompanhamento de horas trabalhadas, cálculo financeiro por projeto e compartilhamento transparente com clientes.

Utiliza o WakaTime como fonte oficial de horas registradas em código e o Supabase como banco de dados principal.

---

# Status do Projeto

| Etapa                 | Status          |
| --------------------- | --------------- |
| Documentação          | ✅ Concluído    |
| Ambiente (.env)       | ✅ Concluído    |
| Supabase              | ✅ Configurado  |
| WakaTime              | ✅ Configurado  |
| Estrutura Inicial     | ✅ Concluído    |
| Banco (Prisma)        | ⚠️ Conexão pendente |
| Integração WakaTime   | ⏳ Em andamento |
| Dashboard             | ⏳ Em andamento |
| Projetos              | ⏳ Em andamento |
| Registros de Trabalho | ⏳ Em andamento |
| Pagamentos            | ⏳ Em andamento |
| Portal Compartilhável | ⏳ Em andamento |
| Deploy                | ⏳ Em andamento |

Site publicado:

```txt
https://worklog-projects.vercel.app/
```

### Progresso Geral

```txt
██████░░░░░░░░░░░░░░ 30%
```

---

# Estrutura do Projeto

```txt
/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── prisma.config.ts
├── .env.local
├── .env.example
├── .gitignore
│
├── docs/
│   ├── vision/
│   │   └── WORKLOG_SPEC.md
│   │
│   ├── planning/
│   │   └── EXECUTION_PLAN.md
│   │
│   ├── project-memory/
│   │   ├── PROGRESS.md
│   │   ├── DECISIONS.md
│   │   ├── TASK_PLAN.md
│   │   └── FINDINGS.md
│   │
│   ├── architecture/
│   │   ├── STACK.md
│   │   ├── DATA_MODEL.md
│   │   └── WAKATIME_SYNC.md
│   │
│   └── references/
│       └── LINKS.md
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 20260604231000_init/
│           └── migration.sql
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── app-shell.tsx
│   └── lib/
│       ├── env.ts
│       └── prisma.ts
└── public/
    ├── favicon.ico
    └── og-worklog-v3.png
```

---

# Documentação Principal

Antes de implementar qualquer coisa, consultar:

1. README.md
2. AGENTS.md
3. docs/vision/WORKLOG_SPEC.md
4. docs/architecture/DATA_MODEL.md
5. docs/architecture/WAKATIME_SYNC.md
6. docs/planning/EXECUTION_PLAN.md
7. docs/project-memory/TASK_PLAN.md
8. docs/project-memory/PROGRESS.md
9. docs/project-memory/DECISIONS.md
10. docs/architecture/STACK.md
11. docs/references/LINKS.md
12. docs/project-memory/FINDINGS.md

`CLAUDE.md` existe apenas como arquivo legado de compatibilidade. Para o Codex, a fonte operacional é `AGENTS.md`.

---

# Decisões Arquiteturais

## Banco

- Supabase PostgreSQL

## ORM

- Prisma ORM

## Rastreamento de Horas

- WakaTime

## Deploy

- Vercel

## Fonte Oficial das Horas

- WakaTime

## Fonte Oficial dos Dados Financeiros

- Banco PostgreSQL (Supabase)

## Registros Manuais

- WorkLogEntry

---

# Objetivo

Centralizar:

- projetos
- clientes
- horas registradas pelo WakaTime
- registros manuais de trabalho
- valores acumulados
- pagamentos realizados
- valores pendentes

Tudo em um único local.

---

# Visão

Fluxo principal:

WakaTime

↓

Sincronização

↓

Supabase

↓

Projetos

↓

Registros de Trabalho

↓

Cálculo Financeiro

↓

Dashboard

↓

Portal Compartilhável

↓

Histórico de Pagamentos

---

# Funcionalidades

## Dashboard Geral

Visualizar:

- horas totais
- horas WakaTime
- horas dedicadas
- valor total
- valor recebido
- valor pendente
- projetos ativos
- projetos pendentes de configuração
- clientes ativos
- última atualização do WakaTime

---

## Projetos

Cada projeto possui:

- nome
- cliente
- valor por hora
- nome do projeto no WakaTime
- horas acumuladas pelo WakaTime
- horas dedicadas manualmente
- valor acumulado
- valor recebido
- saldo pendente
- status ativo/inativo
- status de configuração

Além das horas importadas pelo WakaTime, cada projeto poderá possuir registros manuais de trabalho.

---

## Projetos Automáticos

Sempre que um novo projeto aparecer no WakaTime:

- verificar se já existe no banco
- caso não exista, criar automaticamente

Projeto recém criado:

- ativo
- sem cliente
- sem valor por hora

Status:

```txt
Pendente de Configuração
```

O usuário deverá apenas definir:

- cliente
- valor por hora

---

## Registros de Trabalho

Um registro contém:

- data
- horário de início
- horário de término
- observação opcional

Exemplos:

- reunião
- planejamento
- documentação
- suporte
- desenvolvimento
- ajustes
- revisão
- publicação

O usuário poderá adicionar múltiplos registros no mesmo dia.

Exemplo:

09:00 → 11:30

14:00 → 16:00

22:00 → 01:15

Os registros podem atravessar dias diferentes.

O sistema calculará automaticamente o tempo total dedicado ao projeto.

O usuário poderá editar, remover e adicionar novos registros mesmo após já ter realizado sincronizações anteriores.

O objetivo é registrar todo o tempo dedicado ao projeto, incluindo atividades que normalmente não são capturadas pelo WakaTime.

---

## Clientes

Cada cliente possui:

- nome
- contato
- projetos
- horas totais
- pagamentos realizados
- saldo pendente

---

## Compartilhamento

Gerar links públicos.

Exemplo:

/share/projeto-exemplo

/share/daliancas

/share/worklog

O cliente poderá visualizar:

- horas registradas pelo WakaTime
- horas dedicadas ao projeto
- valor acumulado
- valor pago
- valor pendente
- última atualização

Sem acesso administrativo.

---

## Pagamentos

Registrar:

- data
- valor
- observações

O sistema recalcula automaticamente:

valor acumulado

-

valor recebido

=

valor pendente

---

# Integração WakaTime

Documentação oficial:

https://wakatime.com/developers

Base da API:

https://api.wakatime.com/api/v1/

Importar automaticamente:

- projetos
- horas
- tempo por projeto

Atualização:

- ao abrir dashboard
- atualização manual
- atualização agendada

Regras:

- usar a API Key apenas no backend/server-side
- nunca expor a API Key no frontend
- tratar erros de autenticação
- registrar última sincronização
- criar projetos automaticamente quando necessário

---

# Banco de Dados

Banco principal:

Supabase PostgreSQL

ORM:

Prisma ORM

Regras:

- Prisma será responsável por todas as operações de banco
- Supabase será utilizado como PostgreSQL gerenciado
- autenticação Supabase não será utilizada inicialmente
- toda comunicação deverá passar pelo backend

Estado atual:

- schema inicial criado em `prisma/schema.prisma`
- primeira migration criada em `prisma/migrations/20260604231000_init/migration.sql`
- Prisma Client gerado com sucesso
- Prisma CLI configurado em `prisma.config.ts` para carregar `.env.local`
- aplicação da migration no Supabase pendente porque a `DATABASE_URL` atual usa o endpoint direto IPv6-only

Para aplicar a migration a partir de ambiente IPv4-only, configurar `DIRECT_URL` com a connection string Session Pooler do Supabase ou usar uma Direct Connection em ambiente com IPv6.

---

# Variáveis de Ambiente

Criar um arquivo `.env.local` na raiz do projeto.

Exemplo:

```env
# API Key do WakaTime
WAKATIME_API_KEY=sua_api_key_aqui

# Banco Supabase PostgreSQL usado pelo app
DATABASE_URL="postgresql://usuario:senha@host:porta/postgres"

# Opcional para Prisma CLI/migrations
DIRECT_URL="postgresql://usuario:senha@host:porta/postgres"
```

Criar também um `.env.example`:

```env
WAKATIME_API_KEY=
DATABASE_URL=
DIRECT_URL=
```

Regras:

- a API Key real deve ficar apenas no `.env.local`
- a DATABASE_URL real deve ficar apenas no `.env.local`
- a DIRECT_URL real deve ficar apenas no `.env.local`
- nunca commitar `.env.local`

---

# Controle de Tempo

## Horas WakaTime

Tempo efetivamente registrado pelo WakaTime.

## Horas Dedicadas

Tempo calculado através dos registros de trabalho cadastrados manualmente.

## Diferença

Comparação entre:

- horas dedicadas
- horas registradas pelo WakaTime

Permitindo identificar tempo gasto em atividades fora da programação.

## Valor Financeiro

Horas Dedicadas

×

Valor Hora

=

Valor Total

---

# Direção Visual

O WorkLog deve ter aparência de dashboard moderno, limpo, premium e interativo.

Referência visual principal:

https://dennissnellenberg.com/

Usar como inspiração:

- movimento suave
- microinterações
- sensação de elementos reagindo ao cursor
- efeitos sutis de "grudar" no mouse
- transições fluidas
- interface viva sem exagero
- experiência premium e memorável

Referências adicionais:

- https://dribbble.com/tags/time-tracker
- https://dribbble.com/search/time-tracking-dashboard
- https://dribbble.com/search/dark-saas-dashboard
- https://dribbble.com/search/saas-project-management

Priorizar:

- sidebar bonita
- cards bem desenhados
- gráficos simples
- boa hierarquia visual
- botões com microinterações
- tela de registros de trabalho fácil de usar
- portal compartilhável profissional

Assets de identidade:

- favicon monochrome minimalista em `public/favicon.ico`
- imagem de preview social monochrome versionada em `public/og-worklog-v3.png`
- metadata Open Graph e Twitter Card configurados no App Router com imagem absoluta, `secureUrl`, tipo MIME e dimensões
- navegação desktop/mobile refinada sem logo visual no app
- schema Prisma inicial criado
- primeira migration Prisma criada
- Prisma Client gerado
- `prisma.config.ts` configurado para carregar `.env.local`
- aplicação da migration no Supabase pendente de `DIRECT_URL`/pooler IPv4

---

# Stack

- Next.js
- TypeScript
- TailwindCSS
- Shadcn UI
- PostgreSQL
- Prisma ORM
- Supabase
- Vercel

---

# Próxima Etapa

Implementar:

- configurar `DIRECT_URL` com a Session Pooler do Supabase
- aplicar `npm run prisma:deploy`
- validar conexão real com Supabase
- iniciar M3 — sincronização WakaTime manual

Após conclusão de cada etapa importante, atualizar:

- tabela de status
- barra de progresso
- próxima etapa
- docs/project-memory/PROGRESS.md
- docs/project-memory/TASK_PLAN.md
