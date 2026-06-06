# LINKS

## Objetivo

Centralizar links úteis, referências técnicas e inspirações visuais do WorkLog.

---

# Produto

## WorkLog

Sistema para acompanhamento de:

- horas trabalhadas
- projetos
- clientes
- pagamentos
- valores pendentes
- links compartilháveis

Site publicado:

```txt
https://worklog-projects.vercel.app/
```

Repositório oficial:

```txt
https://github.com/paulogbvr/worklog
```

---

# Referências Técnicas

## WakaTime

Documentação oficial:

```txt
https://wakatime.com/developers
```

Site, chave, plugins e suporte:

```txt
https://wakatime.com/
https://wakatime.com/api-key
https://wakatime.com/plugins
https://wakatime.com/faq
https://wakatime.com/vs-code-plugin
https://wakatime.com/cursor
https://wakatime.com/plugins/windsurf/installing
https://wakatime.com/plugins/zed/installing
```

API base:

```txt
https://api.wakatime.com/api/v1/
```

Uso no projeto:

- buscar projetos
- buscar horas
- sincronizar tempo por projeto

---

## Supabase

Site:

```txt
https://supabase.com/
```

Conexões PostgreSQL e Prisma:

```txt
https://supabase.com/docs/guides/database/connecting-to-postgres
https://supabase.com/docs/guides/database/prisma
https://supabase.com/docs/guides/storage
https://supabase.com/docs/reference/javascript/storage-from-upload
https://supabase.com/docs/reference/javascript/storage-from-download
https://supabase.com/docs/reference/javascript/storage-from-remove
```

Uso no projeto:

- banco PostgreSQL gerenciado
- comprovantes privados de pagamento, quando Storage estiver configurado

Observação:

```txt
Não usar Supabase Auth inicialmente.
```

---

## Prisma

Documentação:

```txt
https://www.prisma.io/docs
```

Uso no projeto:

- ORM
- migrations
- Prisma Client
- conexão com Supabase PostgreSQL

---

## Next.js

Documentação:

```txt
https://nextjs.org/docs
```

Deploy:

```txt
https://nextjs.org/docs/app/getting-started/deploying
```

Uso no projeto:

- frontend
- backend via route handlers
- deploy na Vercel

---

## Vercel

Site:

```txt
https://vercel.com/
```

Uso no projeto:

- deploy

Deploy atual:

```txt
https://worklog-projects.vercel.app/
```

---

# Referências Visuais

## Referência Principal

```txt
https://dennissnellenberg.com/
```

Usar como inspiração para:

- microinterações
- sensação de elementos reagindo ao cursor
- transições fluidas
- experiência premium
- interface viva sem exagero

---

## Dribbble

```txt
https://dribbble.com/tags/time-tracker
```

```txt
https://dribbble.com/search/time-tracking-dashboard
```

```txt
https://dribbble.com/search/dark-saas-dashboard
```

```txt
https://dribbble.com/search/saas-project-management
```

Usar como inspiração para:

- dashboard
- cards
- sidebar
- gráficos
- telas de projetos
- portal compartilhável

---

# Bibliotecas Úteis

## Shadcn UI

```txt
https://ui.shadcn.com/
https://ui.shadcn.com/docs/components/chart
https://ui.shadcn.com/charts
```

Uso:

- componentes base
- cards
- dialogs
- inputs
- buttons
- tables

---

## Motion

```txt
https://motion.dev/
```

Uso:

- animações
- microinterações
- transições
- feedback visual

---

## Recharts

```txt
https://recharts.org/
```

Uso:

- gráficos do dashboard

## Tremor

```txt
https://tremor.so/
https://www.tremor.so/docs/visualizations/area-chart
```

Uso:

- referência visual para gráficos compactos
- não instalado no projeto atual

---

## React Hook Form

```txt
https://react-hook-form.com/
```

Uso:

- formulários

---

## Zod

```txt
https://zod.dev/
```

Uso:

- validação de dados

---

## TanStack Table

```txt
https://tanstack.com/table
```

Uso:

- tabelas de projetos
- tabelas de pagamentos
- tabelas de registros

## pdf-lib

```txt
https://pdf-lib.js.org/
```

Uso:

- gerar PDF do acompanhamento público no backend

---

# Observações

Links externos são apenas referência.

A fonte de verdade do projeto continua sendo:

```txt
README.md
AGENTS.md
docs/vision/WORKLOG_SPEC.md
docs/planning/EXECUTION_PLAN.md
docs/architecture/DATA_MODEL.md
docs/architecture/WAKATIME_SYNC.md
docs/project-memory/DECISIONS.md
docs/architecture/STACK.md
```
