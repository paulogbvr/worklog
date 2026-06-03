# TASK_PLAN

## Prioridade Atual

Objetivo:

Criar a primeira versão funcional do WorkLog utilizando:

- Next.js
- TypeScript
- Prisma
- Supabase
- WakaTime

---

# P0 — Fundação

## TASK-001

### Título

Criar estrutura inicial Next.js

### Status

Pendente

### Objetivo

Criar a base do projeto.

### Entregáveis

- Next.js
- TypeScript
- TailwindCSS
- Estrutura de pastas
- Configurações iniciais

---

## TASK-002

### Título

Configurar Prisma

### Status

Pendente

### Objetivo

Conectar Prisma ao Supabase.

### Entregáveis

- schema.prisma
- Prisma Client
- Prisma Generate
- Primeira Migration

---

## TASK-003

### Título

Criar Models Iniciais

### Status

Pendente

### Objetivo

Criar entidades principais.

### Entregáveis

- Client
- Project
- WorkLogEntry
- Payment
- ShareLink
- SyncLog

---

# P1 — Integração

## TASK-004

### Título

Integrar WakaTime

### Status

Pendente

### Objetivo

Consumir API oficial.

### Entregáveis

- Cliente WakaTime
- Autenticação
- Consulta de Projetos
- Consulta de Horas

---

## TASK-005

### Título

Criar Sincronização Manual

### Status

Pendente

### Objetivo

Permitir atualização sob demanda.

### Entregáveis

- Botão Atualizar Agora
- Atualização de Projetos
- Atualização de Horas
- Registro da Última Sincronização

---

## TASK-006

### Título

Criar Projetos Automáticos

### Status

Pendente

### Objetivo

Criar projetos automaticamente quando surgirem no WakaTime.

### Entregáveis

- Verificação de existência
- Criação automática
- Status pendente de configuração

---

# P2 — Dashboard

## TASK-007

### Título

Criar Dashboard

### Status

Pendente

### Objetivo

Visualizar dados gerais.

### Entregáveis

- Cards
- Indicadores
- Resumos financeiros
- Horas WakaTime
- Horas Dedicadas

---

## TASK-008

### Título

Criar Página de Projetos

### Status

Pendente

### Objetivo

Gerenciar projetos.

### Entregáveis

- Listagem
- Detalhes
- Status de configuração
- Histórico

---

## TASK-009

### Título

Criar Registros de Trabalho

### Status

Pendente

### Objetivo

Permitir registrar trabalho manual.

### Entregáveis

- Adicionar registro
- Editar registro
- Excluir registro
- Cálculo automático

---

## TASK-010

### Título

Criar Gestão de Clientes

### Status

Pendente

### Objetivo

Relacionar clientes aos projetos.

### Entregáveis

- Cadastro
- Edição
- Listagem

---

## TASK-011

### Título

Criar Gestão de Pagamentos

### Status

Pendente

### Objetivo

Controlar recebimentos.

### Entregáveis

- Cadastro
- Histórico
- Valor recebido
- Valor pendente

---

# P3 — Compartilhamento

## TASK-012

### Título

Criar Portal Compartilhável

### Status

Pendente

### Objetivo

Permitir visualização pelo cliente.

### Entregáveis

- Página pública
- Link compartilhável
- Somente leitura

---

# P4 — Visual

## TASK-013

### Título

Aplicar Direção Visual Premium

### Status

Pendente

### Objetivo

Implementar experiência visual inspirada em:

```txt
https://dennissnellenberg.com/
```

### Entregáveis

- Microinterações
- Animações suaves
- Cards premium
- Sidebar moderna
- Transições fluidas

---

# P5 — Produção

## TASK-014

### Título

Preparar Deploy

### Status

Pendente

### Objetivo

Publicar primeira versão.

### Entregáveis

- Build validado
- Variáveis configuradas
- Deploy Vercel

---

# Backlog Futuro

## FUTURE-001

Relatórios PDF

---

## FUTURE-002

Exportação Financeira

---

## FUTURE-003

Filtros Avançados

---

## FUTURE-004

Multiusuário

---

## FUTURE-005

Workspaces

---

# Regra

Ao concluir uma tarefa:

1. Atualizar status da tarefa
2. Atualizar PROGRESS.md
3. Atualizar README.md
4. Registrar novas decisões em DECISIONS.md quando necessário
