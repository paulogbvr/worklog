# DECISIONS

## 2026-06-03

### DECISION-001

#### Título

Banco de Dados Oficial

#### Decisão

O WorkLog utilizará Supabase PostgreSQL como banco oficial.

#### Motivo

- PostgreSQL robusto
- Fácil integração com Prisma
- Plano gratuito suficiente para validação inicial
- Escalável para futuras versões

#### Impacto

Toda persistência do sistema deve utilizar Supabase PostgreSQL.

---

### DECISION-002

#### Título

ORM Oficial

#### Decisão

O WorkLog utilizará Prisma ORM.

#### Motivo

- Excelente integração com PostgreSQL
- Migrations organizadas
- Tipagem forte com TypeScript
- Boa experiência de desenvolvimento

#### Impacto

Todo acesso ao banco deve ocorrer através do Prisma.

---

### DECISION-003

#### Título

Fonte Oficial das Horas

#### Decisão

O WakaTime será a fonte oficial das horas registradas em código.

#### Motivo

- Captura automática
- Baixa fricção
- Dados confiáveis
- Integração simples

#### Impacto

Horas registradas em código devem vir prioritariamente do WakaTime.

---

### DECISION-004

#### Título

Projetos Automáticos

#### Decisão

Projetos devem ser criados automaticamente quando detectados no WakaTime.

#### Motivo

Evitar cadastro manual de projetos.

#### Impacto

Sempre que um projeto novo aparecer no WakaTime:

- verificar existência
- criar automaticamente se necessário
- marcar como ativo
- marcar como pendente de configuração

---

### DECISION-005

#### Título

Projetos Pendentes de Configuração

#### Decisão

Projetos criados automaticamente podem existir sem cliente e sem valor por hora.

#### Motivo

Permitir sincronização automática sem bloquear o fluxo.

#### Impacto

Projetos recém sincronizados devem aparecer como:

```txt
Pendente de Configuração
```

até que o usuário defina:

- cliente
- valor por hora

---

### DECISION-006

#### Título

Registros Manuais

#### Decisão

O sistema permitirá registros manuais de trabalho.

#### Motivo

Nem todo trabalho é capturado pelo WakaTime.

Exemplos:

- reuniões
- planejamento
- suporte
- documentação
- revisão

#### Impacto

Horas Dedicadas podem ser maiores que Horas WakaTime.

---

### DECISION-007

#### Título

Deploy Oficial

#### Decisão

O sistema será hospedado na Vercel.

#### Motivo

- integração nativa com Next.js
- deploy simples
- plano gratuito suficiente para validação

#### Impacto

Toda configuração de produção deve considerar Vercel.

---

### DECISION-008

#### Título

Documentação Viva

#### Decisão

README.md deve ser atualizado após marcos importantes.

#### Motivo

Facilitar retomadas futuras e continuidade entre sessões.

#### Impacto

Ao concluir etapas relevantes:

- atualizar tabela de status
- atualizar barra de progresso
- atualizar próxima etapa

---

### DECISION-009

#### Título

Direção Visual

#### Decisão

A principal referência visual será:

```txt
https://dennissnellenberg.com/
```

#### Motivo

Experiência moderna, premium e altamente interativa.

#### Impacto

Priorizar:

- microinterações
- animações suaves
- sensação de elementos reagindo ao cursor
- experiência premium
- dashboard elegante

---

### DECISION-010

#### Título

Dados Reais

#### Decisão

O projeto deve utilizar dados reais sempre que possível.

#### Motivo

Validar o produto com uso real desde o início.

#### Impacto

Prioridade:

```txt
WakaTime
↓
Backend
↓
Supabase
↓
Frontend
```

Mocks devem ser utilizados apenas como fallback temporário.

---

## 2026-06-04

### DECISION-011

#### Título

URL de Migration Prisma

#### Decisão

O WorkLog poderá usar `DIRECT_URL` como variável opcional para comandos Prisma CLI e migrations, mantendo `DATABASE_URL` como URL principal usada pelo app.

#### Motivo

O endpoint direto do Supabase pode ser IPv6-only. Em ambientes locais ou CI sem IPv6, a migration precisa usar a Session Pooler do Supabase ou uma conexão direta executada em ambiente compatível.

#### Impacto

- `prisma.config.ts` carrega `.env.local`
- Prisma CLI usa `DIRECT_URL` quando definida
- `prisma/schema.prisma` declara `directUrl = env("DIRECT_URL")`
- `.env.example` documenta `DIRECT_URL`
- `.env.local` continua fora do Git

---

### DECISION-012

#### Título

Instruções Oficiais para Codex

#### Decisão

O arquivo `AGENTS.md` será a instrução operacional oficial para o Codex.

`CLAUDE.md` será mantido apenas como ponte legada de compatibilidade.

#### Motivo

Evitar duplicidade entre instruções de agentes e reduzir risco de divergência.

#### Impacto

Mudanças de processo devem ser feitas em `AGENTS.md`.

---

### DECISION-013

#### Título

Separação entre Horas WakaTime e Horas Dedicadas

#### Decisão

Horas WakaTime representam tempo de código sincronizado automaticamente.

Horas Dedicadas representam tempo faturável registrado no WorkLog por `WorkLogEntry`.

#### Motivo

Nem todo trabalho faturável aparece no WakaTime, e nem todo dado técnico do WakaTime precisa virar cálculo financeiro automaticamente.

#### Impacto

O cálculo financeiro inicial deve usar:

```txt
Horas Dedicadas x Valor Hora
```

Horas WakaTime devem ser exibidas para comparação e transparência.

---

### DECISION-014

#### Título

Horas WakaTime Agregadas por Projeto e Dia

#### Decisão

O MVP deve persistir horas WakaTime agregadas por projeto e dia.

#### Motivo

Preservar histórico suficiente para dashboard, comparação e futura filtragem sem armazenar dados excessivos.

#### Impacto

O schema inicial deve incluir uma entidade equivalente a `WakaTimeProjectDay`.

Linguagens, editores e atividades detalhadas ficam fora do MVP.

---

### DECISION-015

#### Título

Gerenciador de Pacotes Inicial

#### Decisão

O WorkLog utilizará `npm` como gerenciador de pacotes inicial.

#### Motivo

O projeto foi inicializado com `package-lock.json`, mantendo instalação simples e compatível com Vercel.

#### Impacto

Comandos oficiais iniciais:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

---

## 2026-06-05

### DECISION-016

#### Título

Prioridade das Horas no Cálculo Financeiro

#### Decisão

Quando um projeto possuir registros manuais, a soma de `WorkLogEntry.durationSeconds` será a base financeira. Enquanto não houver registros manuais, a soma de `WakaTimeProjectDay.totalSeconds` será usada como fallback.

#### Motivo

Permitir cálculo financeiro útil desde o início sem perder a distinção entre tempo automático e tempo dedicado informado manualmente.

#### Impacto

```txt
horas manuais > 0
  ? horas manuais × valor/hora
  : horas WakaTime × valor/hora
```

O dashboard deve indicar qual fonte está sendo usada.

---

### DECISION-017

#### Título

Preferências Visuais Locais

#### Decisão

Tema e estado da sidebar serão preferências locais, persistidas no navegador e aplicadas antes da hidratação.

#### Motivo

Evitar flash visual, manter a escolha do usuário após recarregar e não introduzir conta ou autenticação no MVP.

#### Impacto

- tema padrão: dark
- chave do tema: `worklog-theme`
- chave da sidebar: `worklog-sidebar-state`
- script inicial no layout aplica as preferências antes do React

---

### DECISION-018

#### Título

Estado Ativo dos Projetos WakaTime

#### Decisão

A lista atual retornada por `/users/current/projects` será a fonte do estado ativo dos projetos vinculados ao WakaTime.

Projetos que não estiverem mais nessa lista serão mantidos no banco com:

```txt
active = false
```

#### Motivo

Refletir o estado atual do WakaTime sem apagar horas, pagamentos ou configurações históricas.

#### Impacto

- projetos atuais são reativados durante o sync
- projetos ausentes são arquivados
- dashboard, contadores e operação principal usam apenas projetos ativos
- visualização de arquivados fica como melhoria futura

---

### DECISION-019

#### Título

Leitura Resiliente do Dashboard no Transaction Pooler

#### Decisão

O dashboard terá uma consulta crítica para projetos ativos e leituras auxiliares isoladas. Uma falha em clientes, observações, pagamentos ou último sync não poderá zerar horas e projetos válidos.

No runtime, URLs do Supabase Transaction Pooler na porta `6543` serão normalizadas com parâmetros compatíveis com Prisma, sem alterar ou expor credenciais.

#### Motivo

Em produção, a sincronização gravou corretamente, mas uma falha dentro de consultas concorrentes fez o fallback global retornar todos os indicadores como zero.

#### Impacto

- projetos e horas permanecem visíveis quando uma leitura auxiliar falhar
- erros são registrados sem segredos
- o número de conexões simultâneas é reduzido
- a sincronização revalida e atualiza o dashboard ao concluir

---

### DECISION-020

#### Título

Dados Cadastrais Derivados e Normalizados

#### Decisão

CPF/CNPJ será validado no frontend e no backend, armazenado somente com dígitos e único quando informado.

Data de nascimento será persistida como data. A idade será sempre calculada em tempo real e nunca armazenada.

#### Motivo

Evitar documentos inconsistentes, dados duplicados e idade desatualizada no banco.

#### Impacto

- máscaras são apenas de apresentação
- CPF/CNPJ inválido não chega ao Prisma
- alteração da data atualiza a idade automaticamente
- campos permanecem opcionais para não bloquear o MVP

---

### DECISION-021

#### Título

Configuração Financeira Opcional por Projeto

#### Decisão

Cliente e valor por hora são opcionais. Um projeto será `CONFIGURED` somente quando possuir ambos
e ao menos uma tarifa cobrável positiva. Limpar o cliente ou todas as tarifas cobráveis retorna o
projeto para `PENDING`.

Valor vazio ou zero representa ausência de cobrança e é persistido como `null`.

#### Motivo

O WorkLog também acompanha projetos pessoais, que precisam manter horas e histórico sem cliente e
sem gerar valor financeiro.

#### Impacto

- opção `Sem cliente` disponível na configuração
- valor por hora pode ser vazio ou zero
- projetos sem configuração financeira continuam sincronizados
- identidade WakaTime e histórico não são removidos
- dashboard calcula valor somente para projetos configurados

---

### DECISION-022

#### Título

Fonte de Faturamento Explícita por Projeto

#### Status

Substituída pela `DECISION-025`.

#### Decisão

Cada projeto possui `billingMode` com os valores `WAKATIME` ou `DEDICATED`. O padrão para projetos
novos é `WAKATIME`. O cálculo usa somente a fonte selecionada, sem fallback automático.

Esta decisão substitui a regra de fallback registrada na `DECISION-016`.

#### Impacto

- a configuração fica no modal do projeto
- horas manuais continuam visíveis mesmo quando não são faturáveis
- ausência de registros dedicados em modo `DEDICATED` resulta em valor zero

---

### DECISION-023

#### Título

Operações com Múltiplos Intervalos

#### Decisão

Uma operação de trabalho é persistida como múltiplos `WorkLogEntry` compartilhando o mesmo
`operationId` e a mesma observação.

#### Motivo

Manter o schema simples, preservar os cálculos existentes e permitir pausas sem criar um novo
subsistema de apontamento.

#### Impacto

- criação, edição e exclusão atuam sobre o agrupamento inteiro
- registros antigos recebem `operationId = id`
- duração da operação é a soma dos intervalos

---

### DECISION-024

#### Título

Período do Dashboard

#### Decisão

O dashboard oferece períodos de 7 dias, 30 dias e todo o histórico. A seleção filtra horas
WakaTime, horas dedicadas, pagamentos e valores financeiros na mesma consulta.

#### Impacto

- período padrão: 7 dias
- filtro via query string `period`
- contadores estruturais de projetos e clientes permanecem globais

---

### DECISION-025

#### Título

Cobrança Independente por Tipo de Hora

#### Decisão

Cada projeto possui duas configurações financeiras independentes:

- `hourlyRate` para horas WakaTime
- `dedicatedHourlyRate` para horas dedicadas
- `billDedicated` para habilitar ou desabilitar a cobrança dedicada

O valor total é a soma das fontes com tarifa positiva e habilitada. Esta decisão substitui a
`DECISION-022`, que limitava o projeto a uma única fonte por `billingMode`.

#### Motivo

Horas de código e horas de pesquisa, reunião ou planejamento podem ter preços diferentes e podem
ser cobradas juntas.

#### Impacto

- WakaTime pode ser cobrado sozinho
- horas dedicadas podem ser cobradas sozinhas
- ambas podem ser cobradas simultaneamente
- nenhuma fonte é cobrada quando as tarifas estiverem vazias ou zeradas
- a migration preserva a intenção dos projetos configurados no modelo anterior

---

### DECISION-026

#### Título

Resumo Financeiro Desde o Último Pagamento

#### Decisão

O dashboard calcula, por projeto, horas WakaTime, horas dedicadas e valor gerado a partir do
pagamento mais recente. Quando não houver pagamento, todo o histórico é considerado.

#### Impacto

- o último pagamento é derivado de `Payment.paidAt`
- a métrica não exige novo campo persistido
- totais históricos permanecem disponíveis separadamente do filtro do dashboard

---

## 2026-06-06

### DECISION-027

#### Título

Dashboard como Visão, não como Área Administrativa

#### Decisão

O dashboard contém somente resumo histórico, operação atual e gráficos. Projetos, operações,
clientes, registros e pagamentos possuem páginas próprias.

O período padrão é 7 dias e o filtro opcional por projeto deve afetar horas, valores, gráficos e
operação atual.

#### Motivo

Reduzir densidade visual, melhorar navegação e separar leitura financeira de tarefas de cadastro.

#### Impacto

- formulários deixam a home
- navegação usa rotas dedicadas e prefetch do Next.js
- gráficos exibem séries identificáveis por projeto
- o resumo histórico inclui valor pendente total

---

### DECISION-028

#### Título

Compartilhamento Público com Slug Não Óbvio

#### Decisão

Cada projeto pode manter um link público ativo em `/share/{slug}`. O portal é somente leitura,
pode ser desativado e registra contagem e data do último acesso.

#### Motivo

Permitir transparência com clientes sem criar autenticação ou expor telas administrativas.

#### Impacto

- `Project.repositoryUrl` guarda referência opcional do repositório
- `ShareLink.accessCount` e `lastAccessedAt` registram uso
- acessos e criação de links geram notificações
- nenhum segredo ou controle de escrita é enviado ao portal

---

### DECISION-029

#### Título

Notificações Persistidas sem Infraestrutura de Filas

#### Decisão

Notificações essenciais são persistidas no PostgreSQL e lidas diretamente via Prisma. O MVP não
usa polling contínuo, filas, websockets ou provedores externos.

Eventos iniciais:

- sincronização concluída
- erro de sincronização
- link compartilhado criado
- projeto compartilhado acessado

#### Motivo

Entregar histórico e badge de atividade com baixa complexidade operacional.

#### Impacto

- leitura individual e em lote usa `readAt`
- falha ao criar notificação não derruba sincronização nem portal
- novos tipos podem ser adicionados ao enum quando houver caso real
