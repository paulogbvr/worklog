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
