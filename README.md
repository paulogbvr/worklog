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
| Banco (Prisma)        | ✅ Concluído    |
| Integração WakaTime   | ✅ Sync manual  |
| Dashboard             | ✅ Métricas, gráficos e filtros |
| Projetos              | ✅ Cobrança independente por tipo de hora |
| Clientes              | ✅ CRUD e validações |
| Registros de Trabalho | ✅ CRUD concluído |
| Pagamentos            | ✅ Controle básico |
| Portal Compartilhável | ✅ Somente leitura |
| Notificações          | ✅ Eventos essenciais |
| Deploy                | ⚙️ Publicado, proteção pendente |

Site publicado:

```txt
https://worklog-projects.vercel.app/
```

### Progresso Geral

```txt
███████████████████░ 94%
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
│       ├── 20260604231000_init/
│       ├── 20260605011210_project_notes/
│       ├── 20260605162000_billing_modes_and_work_operations/
│       ├── 20260605170000_client_profile_fields/
│       ├── 20260605203000_dual_billing_rates/
│       └── 20260606013000_project_sharing_notifications/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── clients/
│   │   │   ├── notifications/
│   │   │   ├── payments/
│   │   │   ├── projects/
│   │   │   └── wakatime/
│   │   ├── about/
│   │   ├── clients/
│   │   ├── flow/
│   │   ├── installation/
│   │   ├── notifications/
│   │   ├── operations/
│   │   ├── payments/
│   │   ├── projects/
│   │   ├── records/
│   │   ├── share/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── manifest.ts
│   │   └── page.tsx
│   ├── components/
│   │   ├── app-shell.tsx
│   │   ├── brand-logo.tsx
│   │   ├── dashboard-charts.tsx
│   │   ├── dashboard-filters.tsx
│   │   ├── notification-menu.tsx
│   │   ├── notifications-center.tsx
│   │   ├── operations-panel.tsx
│   │   ├── status-pulse.tsx
│   │   ├── toast-provider.tsx
│   │   └── wakatime/
│   │       └── sync-now-button.tsx
│   ├── lib/
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── content/
│   │   └── site.ts
│   └── server/
│       ├── dashboard/
│       │   └── summary.ts
│       └── wakatime/
│           ├── client.ts
│           └── sync.ts
└── public/
    ├── creator-photo.jpeg
    ├── favicon.ico
    ├── icon-worklog.png
    ├── og-worklog-v5.png
    ├── og-worklog-v4.svg
    └── worklog-mark.svg
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

- resumo histórico de horas WakaTime e dedicadas
- valor pendente em todo o histórico
- operação atual por projeto
- gráficos com séries por projeto
- filtros de 7 dias, 30 dias e todo o histórico
- filtro por projeto
- última atualização do WakaTime

---

## Projetos

Cada projeto possui:

- nome
- cliente opcional
- valor/hora WakaTime opcional
- valor/hora dedicada opcional
- opção para cobrar horas dedicadas
- repositório Git opcional
- link público somente leitura
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

Quando houver cobrança, o usuário poderá definir:

- cliente
- valor por hora

Projetos pessoais podem permanecer sem cliente e sem valor por hora. Nesse estado, continuam
sincronizados e não geram valor financeiro.

Quando um projeto deixa de existir na lista atual do WakaTime:

- `active` passa para `false`
- horas, pagamentos e configuração são preservados
- o projeto deixa de aparecer no dashboard principal
- uma visualização de arquivados poderá ser adicionada futuramente

---

## Registros de Trabalho

Um registro contém:

- projeto
- um ou mais intervalos de início e término
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

Uma operação pode agrupar vários intervalos separados por pausas. Os intervalos podem atravessar a
meia-noite e são somados automaticamente. A operação inteira pode ser criada, editada e removida.

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

Cada acesso atualiza a contagem do link e gera uma notificação no painel administrativo.

---

## Notificações

Eventos atuais:

- sincronização concluída
- erro de sincronização
- novo link compartilhado
- projeto compartilhado acessado

Disponíveis no badge da sidebar, dropdown de atividade e página completa.

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

- atualização manual
- atualização agendada futura

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
- migration `20260604231000_init` aplicada com sucesso no Supabase
- migration `20260605011210_project_notes` registrada e aplicada no Supabase
- migration `20260605170000_client_profile_fields` aplicada no Supabase
- migration `20260605203000_dual_billing_rates` aplicada no Supabase
- migration `20260606013000_project_sharing_notifications` aplicada no Supabase
- Prisma Client regenerado automaticamente antes de cada build
- sincronização real validada usando Prisma e Supabase
- projetos removidos do WakaTime são arquivados sem perda de histórico

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

Cada tipo de hora possui cobrança independente:

```txt
(Horas WakaTime × Valor/hora WakaTime)
+
(Horas Dedicadas × Valor/hora dedicada, quando habilitado)
=
Valor Total
```

Um projeto pode cobrar WakaTime, horas dedicadas, ambas ou nenhuma. Campo vazio ou zero não gera
cobrança para aquela fonte.

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

- marca oficial baseada no ícone `FaCode`, aplicada na sidebar desktop/mobile
- favicon e ícone do app em `public/favicon.ico` e `public/icon-worklog.png`
- imagem de preview social versionada em `public/og-worklog-v5.png`
- metadata Open Graph e Twitter Card configurados no App Router com imagem absoluta, `secureUrl`, tipo MIME e dimensões
- manifest do app configurado
- navegação desktop/mobile refinada com identidade visual oficial
- schema Prisma inicial criado
- primeira migration Prisma criada
- Prisma Client gerado
- `prisma.config.ts` configurado para carregar `.env.local`
- migration `20260604231000_init` aplicada no Supabase
- migration `20260605162000_billing_modes_and_work_operations` aplicada no Supabase
- migration `20260605203000_dual_billing_rates` aplicada no Supabase
- migration `20260606013000_project_sharing_notifications` aplicada no Supabase
- cliente WakaTime server-side criado
- rota `POST /api/wakatime/sync` criada
- botão manual `Atualizar agora` conectado ao backend
- dashboard inicial lendo resumo real do banco
- dashboard com leitura resiliente ao Transaction Pooler e atualização imediata após sincronização
- listagem inicial de projetos sincronizados adicionada ao dashboard
- sidebar minimizada com tooltip acima do conteúdo
- estado da sidebar persistido em `localStorage`
- alternância dark/light mode com persistência em `localStorage`
- preferências aplicadas antes da hidratação para evitar flash de tema ou sidebar
- status reutilizável para ambiente e notificações
- status das variáveis baseado apenas em presença e formato válido, sem expor valores
- toasts premium para sincronização e operações
- CRUD de clientes com CPF/CNPJ, telefone, nascimento, idade derivada e endereço
- validação real e máscara automática de CPF/CNPJ
- configuração de nome, cliente, valor/hora, status e observações de projetos
- projeto pode voltar ao estado pendente/sem cobrança ao limpar cliente e valor por hora
- erros específicos para cliente, valor/hora e projeto inexistente
- cadastro e remoção de pagamentos
- CRUD de registros de trabalho com edição, exclusão e travessia de meia-noite
- operações de trabalho com múltiplos intervalos e observação única
- tarifas independentes para WakaTime e horas dedicadas
- toggle para incluir ou não horas dedicadas na cobrança
- filtros de dashboard para 7 dias, 30 dias e todo o período
- período padrão de 7 dias e filtro opcional por projeto
- gráficos responsivos com linha, cor, legenda e tooltip por projeto
- métricas desde o último pagamento e totais históricos por projeto
- dashboard focado em resumo histórico, operação atual e gráficos
- páginas dedicadas de projetos, operações, clientes, registros e pagamentos
- campo de repositório Git por projeto
- links públicos somente leitura com ativação e desativação
- portal `/share/{slug}` com horas, valores, pagamentos e última sincronização
- notificações para compartilhamento, acesso público e sincronização
- badge, dropdown e página completa de notificações
- páginas públicas `Fluxo`, `Instalação` e `Sobre`
- repositório oficial destacado na página de instalação
- foto oficial do criador em `public/creator-photo.jpeg`
- card de variáveis alinhado na sidebar expandida do desktop
- header móvel, safe-area e `theme-color` sincronizados com o tema antes da hidratação

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
- Recharts

---

# Próxima Etapa

Implementar:

- proteção administrativa antes de ampliar o uso público
- validar o novo fluxo no deploy da Vercel

Após conclusão de cada etapa importante, atualizar:

- tabela de status
- barra de progresso
- próxima etapa
- docs/project-memory/PROGRESS.md
- docs/project-memory/TASK_PLAN.md
