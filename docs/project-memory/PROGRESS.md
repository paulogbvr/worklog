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

---

## 2026-06-04

### Prisma Aplicado e Sincronização WakaTime Manual

Concluído:

- migration `20260604231000_init` aplicada com sucesso no Supabase
- `npm run prisma:deploy` validado com sucesso
- cliente server-side WakaTime criado
- rota `POST /api/wakatime/sync` criada
- serviço de sincronização manual criado
- projetos WakaTime criados automaticamente como ativos e pendentes de configuração
- horas WakaTime salvas por projeto e dia em `WakaTimeProjectDay`
- tentativas de sync registradas em `SyncLog`
- dashboard inicial passou a ler resumo real do banco
- botão `Atualizar agora` conectado ao backend
- painel de ambiente da sidebar passou a exibir `DIRECT_URL`

Validação real:

```txt
6 projetos encontrados
6 projetos criados
15 registros diários sincronizados
84954 segundos importados
```

Validação técnica:

```bash
npm run lint
npm run typecheck
npm run build
```

Resultado:

```txt
sucesso
```

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
85%
```

Implementação:

```txt
22%
```

Projeto Geral:

```txt
███████░░░░░░░░░░░░░ 35%
```

---

### Próximo Passo

Implementar:

1. Dashboard real completo
2. Listagem de projetos sincronizados
3. Destaque para projetos pendentes de configuração
4. Configuração de cliente e valor/hora por projeto

---

## 2026-06-04

### Correções de Sidebar, Tema e Dashboard Real Inicial

Concluído:

- tooltip da sidebar minimizada corrigido com z-index mais alto, sidebar em camada própria e containers sem clip
- estado da sidebar persistido em `localStorage`
- chave usada: `worklog-sidebar-state`
- alternância dark/light mode adicionada
- tema persistido em `localStorage`
- chave usada: `worklog-theme`
- dark mode mantido como padrão
- light mode desenhado com variáveis próprias de superfície, texto, borda e profundidade
- `DIRECT_URL` exibida no painel de ambiente da sidebar
- dashboard passou a exibir listagem inicial de projetos sincronizados
- projetos pendentes de configuração destacados na listagem inicial

Validação técnica:

```bash
npm run lint
npm run typecheck
```

Resultado:

```txt
sucesso
```

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
85%
```

Implementação:

```txt
25%
```

Projeto Geral:

```txt
████████░░░░░░░░░░░░ 38%
```

---

### Próximo Passo

Implementar:

1. Configuração de cliente e valor/hora por projeto
2. CRUD de registros de trabalho
3. Pagamentos por projeto

---

## 2026-06-05

### Operação Financeira, Branding e UX Persistente

Concluído:

- marca oficial do WorkLog baseada no `FaCode`
- logo aplicada na sidebar desktop, drawer mobile, favicon, ícone do app e preview social
- Open Graph atualizado para `og-worklog-v4.png`
- preferências de tema e sidebar aplicadas antes da hidratação
- tooltip da sidebar validado com containers sem clip e camada acima do conteúdo
- dark/light mode persistente e light mode com paleta própria
- `StatusPulse` reutilizável para sucesso, erro, aviso e estado neutro
- toasts para sincronização e operações
- painel de ambiente validando `DATABASE_URL`, `DIRECT_URL` e `WAKATIME_API_KEY`
- sincronização WakaTime otimizada com buscas paralelas e persistência em lote
- CRUD básico de clientes
- configuração de projetos com cliente, valor/hora, nome, status e observações
- cadastro, histórico e remoção de pagamentos
- dashboard financeiro usando horas manuais como prioridade e WakaTime como fallback
- migration `20260605011210_project_notes` aplicada e registrada no Supabase
- projetos removidos da lista atual do WakaTime arquivados com `active = false`
- histórico dos projetos arquivados preservado no banco
- dashboard e contadores filtrados para projetos ativos

Validação real:

```txt
Sincronização repetida: 2 projetos retornados pela API
5 registros diários persistidos
0 novos projetos
4 projetos antigos arquivados
HTTP 200
```

Validação técnica:

```bash
npm run lint
npm run typecheck
npm run prisma:validate
npm run prisma:generate
npm run build
```

Resultado:

```txt
sucesso
```

Validação funcional:

- sidebar e tema persistem após recarregar
- tema claro aplica `color-scheme: light` e paleta própria
- atalhos da navegação abrem a aba operacional correta
- layout móvel validado em 390 × 844 sem rolagem horizontal
- criação, edição e remoção temporária de cliente validadas contra o Supabase
- validações inválidas de projeto e pagamento retornam HTTP 400
- sincronização real exibe toasts de início e conclusão
- dashboard passou de 6 para 2 projetos ativos
- lista principal mostra somente `worklog` e `core`

### Correção Crítica do Dashboard e Polimento da Sidebar

Concluído:

- fluxo de sincronização investigado em produção e confirmado gravando no Supabase
- leitura do dashboard deixou de depender de consultas concorrentes em um único `Promise.all`
- consulta de projetos ativos tornou-se a leitura crítica; consultas auxiliares possuem fallback isolado
- configuração de runtime do Prisma normaliza parâmetros seguros do Transaction Pooler
- rota de sincronização invalida a página e o frontend atualiza o resumo após concluir
- status de `DATABASE_URL`, `DIRECT_URL` e `WAKATIME_API_KEY` usa presença e formato válido
- header da sidebar expandida alinhado com logo e botão de recolher na mesma linha
- logo oficial `FaCode` validada nos estados expandido, minimizado e mobile
- controle de tema redesenhado com estado atual coerente
- largura da sidebar aplicada antes da hidratação e sincronizada por variável CSS
- tooltip compacto mantido acima do conteúdo com camada própria e sem recorte
- preview social atualizado para `og-worklog-v5.png` para renovar caches externos

Evidência:

```txt
Sync de produção: 2 projetos, 5 registros diários, HTTP 200
Banco: worklog e core ativos; 4 projetos históricos inativos
Dashboard local após sync: 2 projetos ativos e horas WakaTime atualizadas
Variáveis na sidebar: DATABASE_URL ok, DIRECT_URL ok, WAKATIME_API_KEY ok
```

Validação visual:

- desktop em 1440 × 900
- mobile em 390 × 844 sem rolagem horizontal
- sidebar expandida e minimizada sem sobreposição
- tema light persistido após recarregar
- sincronização atualizou métricas e projetos sem recarregamento manual

### Clientes Validados e Configuração de Projetos Restaurada

Concluído:

- causa da falha de projeto isolada no Prisma Client desatualizado do build de produção
- `npm run build` passou a executar `prisma generate` antes do Next.js
- configuração de projeto exige cliente existente e valor/hora maior que zero
- erros específicos para cliente obrigatório, valor inválido e projeto inexistente
- configuração validada refletindo status, valor gerado e saldo pendente no dashboard
- CPF e CNPJ com máscara automática e validação de dígitos verificadores
- documentos inválidos conhecidos e sequências repetidas rejeitados
- CPF/CNPJ armazenado somente com dígitos e protegido contra duplicidade
- data de nascimento com idade calculada em tempo real, sem persistir idade
- telefone com máscara automática e suporte à entrada com código `+55`
- endereço estruturado como campo próprio do cliente
- criação e edição usam a mesma validação server-side
- migration `20260605170000_client_profile_fields` aplicada no Supabase
- `directUrl` declarada no schema Prisma para migrations pela Session Pooler

Validação funcional:

```txt
Projeto sem cliente: HTTP 400
Valor/hora igual a zero: HTTP 400
Projeto inexistente: HTTP 404
Projeto configurado com valor 123,45: HTTP 200
CPF inválido: HTTP 400
CPF/CNPJ duplicado: HTTP 409
Data futura: HTTP 400
Criação, edição e remoção temporárias: HTTP 200
```

Dados temporários foram removidos e os projetos reais foram restaurados após os testes.

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
90%
```

Implementação:

```txt
58%
```

Projeto Geral:

```txt
█████████████░░░░░░░ 67%
```

### Próximo Passo

Implementar:

1. CRUD de registros de trabalho
2. registros atravessando meia-noite
3. filtros por período
4. portal compartilhável somente leitura

---

## 2026-06-05

### Projetos sem Cobrança e Registros de Trabalho

Concluído:

- card de ambiente alinhado na sidebar expandida do desktop
- linhas de variável com indicador e nome à esquerda e status à direita
- opção `Sem cliente` na configuração de projeto
- valor por hora pode ser vazio ou zero
- projeto sem cliente ou cobrança volta para `PENDING`
- identidade WakaTime, horas e histórico são preservados
- projeto sem configuração financeira não gera valor
- validação nativa obrigatória removida do formulário de projeto
- CRUD de registros de trabalho
- duração derivada automaticamente do início e término
- suporte a registros atravessando meia-noite
- recálculo imediato de horas dedicadas e valores financeiros
- navegação da sidebar conectada à aba de registros

Validação funcional reversível:

```txt
worklog sem cliente/valor: PENDING, WakaTime preservado
registro 22:00 → 01:15: 11700 segundos (3h15)
edição para 4h: 14400 segundos
criação, edição e exclusão: HTTP 200
dados reais restaurados e zero registros temporários
```

Validação técnica:

```bash
npm run lint
npm run typecheck
npm run build
```

Resultado:

```txt
sucesso
```

### Status Atual

Documentação:

```txt
100%
```

Infraestrutura:

```txt
90%
```

Implementação:

```txt
68%
```

Projeto Geral:

```txt
███████████████░░░░░ 73%
```

### Próximo Passo

Implementar:

1. filtros por período
2. portal compartilhável somente leitura
3. proteção administrativa antes de ampliar o uso público
