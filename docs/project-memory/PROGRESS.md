# PROGRESS

## 2026-06-03

### Fundação do Projeto

Concluído:

- Repositório criado
- README.md criado
- CLAUDE.md criado
- WORKLOG_SPEC.md criado
- EXECUTION_PLAN.md criado

---

### Ambiente

Concluído:

- `.env.local` criado
- `.env.example` criado
- `.gitignore` configurado

Variáveis configuradas:

- WAKATIME_API_KEY
- DATABASE_URL

---

### Banco de Dados

Concluído:

- Projeto criado no Supabase
- Banco PostgreSQL criado
- Connection String obtida
- DATABASE_URL configurada no `.env.local`

Banco oficial do projeto:

```txt
Supabase PostgreSQL
```

---

### WakaTime

Concluído:

- Conta WakaTime configurada
- API Key configurada no `.env.local`

Fonte oficial das horas:

```txt
WakaTime
```

---

### Estrutura de Documentação

Concluído:

- docs/
- docs/vision/
- docs/planning/
- docs/project-memory/
- docs/architecture/
- docs/references/

---

### Decisões Confirmadas

- Banco: Supabase PostgreSQL
- ORM: Prisma
- Deploy: Vercel
- Fonte de horas: WakaTime
- Projetos devem ser criados automaticamente a partir do WakaTime
- Registros manuais complementam as horas do WakaTime
- README deve ser mantido atualizado
- AGENTS.md deve ser seguido antes de qualquer implementação

---

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
60%
```

Implementação:

```txt
0%
```

Projeto Geral:

```txt
████░░░░░░░░░░░░░░░░ 20%
```

---

### Próximo Passo

Implementar:

1. Estrutura Next.js
2. Prisma
3. Conexão Supabase
4. Integração WakaTime
5. Dashboard inicial

---

### Observações

O projeto deve utilizar dados reais.

Não utilizar mocks como fonte principal.

Sempre que possível:

```txt
WakaTime
↓
Backend
↓
Supabase
↓
Frontend
```

Projetos novos detectados no WakaTime devem ser criados automaticamente no banco como:

```txt
Pendente de Configuração
```

---

## 2026-06-04

### Alinhamento Documental para Codex

Concluído:

- `AGENTS.md` definido como instrução operacional oficial
- `CLAUDE.md` mantido apenas como ponte legada
- `docs/architecture/DATA_MODEL.md` criado
- `docs/architecture/WAKATIME_SYNC.md` criado
- `docs/project-memory/TASK_PLAN.md` transformado em roadmap de implementação
- README atualizado com nova ordem de leitura e estrutura documental

---

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
60%
```

Implementação:

```txt
0%
```

Projeto Geral:

```txt
████░░░░░░░░░░░░░░░░ 20%
```

---

### Próximo Passo

Implementar:

1. Fundação Next.js
2. TypeScript
3. TailwindCSS
4. estrutura inicial de `src/`
5. scripts de validação

---

## 2026-06-04

### Fundação Next.js

Concluído:

- Next.js inicializado
- TypeScript configurado
- TailwindCSS configurado
- scripts `dev`, `lint`, `typecheck`, `build` e `start` criados
- tela inicial em `src/app/page.tsx`
- layout global em `src/app/layout.tsx`
- estilos globais em `src/app/globals.css`
- validação server-side de variáveis em `src/lib/env.ts`
- `package-lock.json` gerado
- versões de dependências fixadas em `package.json`

---

### Validação

Executado com sucesso:

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

Servidor local validado:

```txt
http://127.0.0.1:3000
```

Resposta HTTP:

```txt
200 OK
```

---

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
70%
```

Implementação:

```txt
10%
```

Projeto Geral:

```txt
█████░░░░░░░░░░░░░░░ 25%
```

---

### Próximo Passo

Implementar:

1. Prisma
2. schema inicial
3. conexão Supabase PostgreSQL
4. Prisma Client
5. primeira migration

---

## 2026-06-04

### Deploy Inicial Vercel

Concluído:

- deploy inicial publicado na Vercel
- URL pública registrada na documentação
- resposta HTTP validada com sucesso

URL:

```txt
https://worklog-projects.vercel.app/
```

Resposta HTTP:

```txt
200 OK
```

---

### Próximo Passo

Continuar:

1. diagnosticar migration Prisma no Supabase
2. aplicar primeira migration
3. concluir M2 — Prisma e Banco

---

## 2026-06-04

### Identidade Compartilhável

Concluído:

- favicon próprio do WorkLog criado
- `public/icon.png` criado
- `public/apple-icon.png` criado
- `public/og-image.png` criado
- metadata principal configurada no App Router
- Open Graph configurado
- Twitter Card configurado

Objetivo:

Garantir uma prévia bonita e profissional quando o link do WorkLog for compartilhado em WhatsApp, Discord, Telegram, iMessage, LinkedIn e redes sociais.

Arquivos:

```txt
public/favicon.ico
public/icon.png
public/apple-icon.png
public/og-image.png
src/app/layout.tsx
```

---

## 2026-06-04

### Refinamento de Branding e Navegação

Concluído:

- logo visual removida do app
- texto `MVP pessoal` removido da interface
- `public/icon.png` removido
- `public/apple-icon.png` removido
- favicon recriado em estilo monochrome minimalista
- `public/og-image.png` recriado em estilo graphite/monochrome
- metadata social corrigida com URL absoluta para a imagem Open Graph
- navegação desktop refeita com sidebar recolhível
- navegação mobile refeita com drawer leve
- tooltips adicionados aos ícones da sidebar recolhida

Objetivo:

Manter uma identidade própria do WorkLog, sem logo quadrada, sem visual azul forte e com preview compartilhável mais profissional.

Arquivos:

```txt
public/favicon.ico
public/og-image.png
src/app/layout.tsx
src/app/page.tsx
src/components/app-shell.tsx
```

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
70%
```

Implementação:

```txt
12%
```

Projeto Geral:

```txt
█████░░░░░░░░░░░░░░░ 26%
```

---

## 2026-06-04

### Correção de Preview Social e Acentuação

Concluído:

- HTML de produção inspecionado com user-agents padrão, Facebook e WhatsApp
- tags `og:image`, `og:image:width`, `og:image:height`, `og:title`, `og:description`, `twitter:image`, `twitter:title` e `twitter:description` confirmadas em produção
- ausência de conflitos `opengraph-image.*` e `twitter-image.*` confirmada
- imagem social versionada criada em `public/og-worklog-v3.png`
- metadata Open Graph atualizada para usar exclusivamente `https://worklog-projects.vercel.app/og-worklog-v3.png`
- metadata reforçada com `secureUrl`, `type`, largura, altura e alt
- favicon mantido apenas como favicon em `public/favicon.ico`
- textos visíveis do app revisados para acentuação correta em PT-BR

Diagnóstico:

O problema não era ausência de tags Open Graph no HTML atual. A causa encontrada foi cache de preview social usando a URL estável anterior `og-image.png`. Como WhatsApp e outros crawlers podem manter o preview antigo por URL, a correção aplicada foi versionar a imagem social com um novo caminho público.

Arquivos:

```txt
public/favicon.ico
public/og-worklog-v3.png
src/app/layout.tsx
src/app/page.tsx
src/components/app-shell.tsx
```

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
70%
```

Implementação:

```txt
13%
```

Projeto Geral:

```txt
█████░░░░░░░░░░░░░░░ 27%
```

---

## 2026-06-04

### Prisma e Banco

Concluído:

- `prisma/schema.prisma` validado contra o modelo do MVP
- Prisma Client gerado com sucesso
- migration inicial criada em `prisma/migrations/20260604231000_init/migration.sql`
- `prisma.config.ts` criado para carregar `.env.local` nos comandos Prisma
- `.env.example` atualizado com `DIRECT_URL` opcional para Prisma CLI/migrations
- scripts `prisma:validate`, `prisma:generate`, `prisma:migrate` e `prisma:deploy` disponíveis

Validação Prisma:

```bash
npm run prisma:validate
npm run prisma:generate
```

Resultado:

```txt
sucesso
```

Bloqueio:

```txt
npm run prisma:deploy
```

falhou porque a `DATABASE_URL` atual aponta para o endpoint direto do Supabase:

```txt
db.djuyxaznecfkwcjzkwlh.supabase.co:5432
```

Esse host não possui registro IPv4 neste ambiente, apenas IPv6, e o Prisma retorna:

```txt
P1001 Can't reach database server
```

Ação necessária:

Configurar `DIRECT_URL` no `.env.local` com a Session Pooler do Supabase ou executar a migration em ambiente com IPv6.

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
75%
```

Implementação:

```txt
15%
```

Projeto Geral:

```txt
██████░░░░░░░░░░░░░░ 30%
```
