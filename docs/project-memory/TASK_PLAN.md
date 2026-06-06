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
- marca oficial baseada no `FaCode`
- imagem de preview social versionada em `public/og-worklog-v5.png`
- navegação desktop/mobile com logo oficial
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
- preferências aplicadas antes da hidratação
- dashboard financeiro com dados reais
- configuração de projetos
- CRUD básico de clientes
- cadastro e histórico básico de pagamentos
- toasts e status reutilizáveis
- sincronização WakaTime em lote, adequada ao Transaction Pooler
- arquivamento automático de projetos removidos do WakaTime
- dashboard com leituras sequenciais/resilientes e atualização após sincronização
- cobrança independente para horas WakaTime e horas dedicadas
- gráficos responsivos com Recharts
- páginas públicas de fluxo, instalação e créditos
- páginas dedicadas para projetos, operações, clientes, registros e pagamentos
- portal compartilhável somente leitura
- notificações de sincronização e compartilhamento

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
- projeto removido da lista atual fica inativo sem perder histórico: concluído
- erro de API não derruba o dashboard: concluído

Validação real:

```txt
6 projetos encontrados
6 projetos criados
15 registros diários sincronizados
84954 segundos importados
```

Validação de arquivamento:

```txt
2 projetos ativos retornados
4 projetos antigos arquivados
dashboard exibindo apenas worklog e core
```

---

# M4 — Dashboard Real

Status:

```txt
Concluído
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
- revalidação e atualização do painel após sincronização
- leitura resiliente para não zerar todo o resumo quando uma consulta auxiliar falhar
- filtros de 7 dias, 30 dias e todo o período
- tarifas independentes respeitadas por projeto
- métricas desde o último pagamento
- totais históricos globais e por projeto
- gráficos de horas e movimento financeiro
- filtro por projeto
- linhas, cores, legendas e tooltips por projeto
- período padrão de 7 dias

Critério de aceite:

- dashboard funciona com banco vazio
- dashboard funciona após sincronização real
- valores financeiros combinam somente as fontes habilitadas no projeto
- sidebar mantém estado após atualizar a página
- tema mantém estado após atualizar a página

Resultado:

- resumo real de horas e valores concluído
- listagem operacional de projetos concluída
- estados vazio e indisponível preservados
- cálculo financeiro soma WakaTime e horas dedicadas quando ambas estiverem configuradas
- filtro de período recalcula horas, pagamentos e valores
- sincronização atualiza métricas e lista de projetos imediatamente
- erros auxiliares do banco não apagam projetos e horas já disponíveis
- cards superiores redundantes removidos
- resumo histórico destaca WakaTime, dedicadas e valor pendente
- dashboard não contém mais formulários administrativos

---

# M5 — Projetos, Clientes e Registros

Status:

```txt
Concluído
```

Objetivo:

Permitir configurar projetos e registrar trabalho manual.

Entregáveis:

- cadastro e edicao de clientes
- validação e máscara de CPF/CNPJ
- data de nascimento com idade derivada
- telefone e endereço
- configuração de cliente e valor/hora em projetos
- configuração das tarifas WakaTime e dedicada
- toggle para cobrar horas dedicadas
- CRUD de registros de trabalho
- múltiplos intervalos por operação
- suporte a registros atravessando meia-noite
- recálculo de duração

Critério de aceite:

- projeto pendente pode virar configurado
- registros alteram horas dedicadas
- valor total recalcula corretamente

Estado:

- cadastro, edição e remoção de clientes: concluído
- validações cadastrais de clientes: concluído
- configuração de projeto com reflexo financeiro: concluído
- projeto pessoal pode permanecer sem cliente e sem cobrança: concluído
- mensagens específicas de validação e persistência: concluído
- CRUD de registros de trabalho: concluído
- agrupamento de múltiplos intervalos por operação: concluído
- travessia de meia-noite e recálculo de duração: concluído
- cobrança WakaTime e dedicada independente: concluído

---

# M6 — Pagamentos

Status:

```txt
Concluído
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

Resultado:

- cadastro e remoção de pagamentos concluídos
- histórico recente disponível no painel
- valor recebido e saldo pendente recalculados no resumo

---

# M7 — Portal Compartilhavel

Status:

```txt
Concluído
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

Resultado:

- campo de repositório Git disponível na configuração do projeto
- criação, cópia, abertura e desativação do link público
- portal `/share/{slug}` com horas, valores, pagamentos e última sincronização
- acessos contabilizados sem permitir escrita
- notificações para link criado e projeto acessado

---

# M8 — Visual Premium e Deploy

Status:

```txt
Em andamento
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

Estado:

- branding, favicon, manifest e preview social v5 concluídos
- tema, sidebar, tooltips, estados, pre-hydration e responsividade validados
- dashboard compacto, gráficos e métricas históricas concluídos
- páginas `/flow`, `/installation` e `/about` concluídas
- créditos de Paulo Oliveira com GitHub, Instagram e LinkedIn concluídos
- foto oficial do criador e repositório oficial publicados
- dashboard reorganizado e filtrável por projeto
- páginas dedicadas para cada fluxo administrativo
- navegação via `Link` e prefetch nativo
- badge, dropdown e página completa de notificações
- proteção administrativa continua pendente

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
- filtros personalizados por datas
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
