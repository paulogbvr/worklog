# WORKLOG_SPEC

## MVP V1

### Dashboard

Exibir:

- horas totais
- horas WakaTime
- horas dedicadas
- diferença entre horas WakaTime e horas dedicadas
- valor total
- valor pendente
- valor recebido
- projetos ativos
- projetos pendentes de configuração
- clientes ativos
- última atualização do WakaTime

---

### Projetos

Campos:

- nome
- cliente
- valor_hora
- wakatime_project_name
- ativo

Cada projeto deve possuir:

- horas registradas pelo WakaTime
- horas dedicadas manualmente
- valor acumulado
- valor recebido
- valor pendente
- registros de trabalho
- pagamentos
- status de configuração
- última sincronização

---

### Status de Configuração

Um projeto pode estar:

- configurado
- pendente de configuração

Projeto configurado:

- possui cliente
- possui valor por hora

Projeto pendente:

- foi criado automaticamente pelo WakaTime
- ainda não possui cliente
- ainda não possui valor por hora

Projetos pendentes devem ser destacados no dashboard.

---

### Registros de Trabalho

Campos:

- projeto
- data_inicio
- data_fim
- observacao

Regras:

- permitir múltiplos registros no mesmo dia
- permitir edição posterior
- permitir exclusão
- permitir registros atravessando meia-noite
- recalcular automaticamente as horas dedicadas
- recalcular automaticamente o valor acumulado

Exemplo:

09:00 → 11:30

14:00 → 16:00

22:00 → 01:15

Tempo total dedicado:

7h45min

---

### Clientes

Campos:

- nome
- email
- telefone
- observacoes

Cada cliente pode possuir vários projetos.

---

### Pagamentos

Campos:

- projeto
- valor
- data
- observacao

Regras:

- cada pagamento pertence a um projeto
- o valor pago deve reduzir o valor pendente
- o histórico de pagamentos deve aparecer no dashboard
- o histórico de pagamentos deve aparecer no projeto
- o histórico de pagamentos deve aparecer no portal compartilhável

---

### Compartilhamento

Links públicos.

Exemplo:

/share/{slug}

O portal compartilhável deve ser somente leitura.

O cliente poderá visualizar:

- nome do projeto
- cliente
- horas WakaTime
- horas dedicadas
- valor acumulado
- valor recebido
- valor pendente
- histórico de pagamentos
- última atualização

O cliente não poderá editar informações.

---

# Integração WakaTime

## Necessário

Conta WakaTime.

API Key.

Documentação oficial:

https://wakatime.com/developers

Base da API:

https://api.wakatime.com/api/v1/

---

## Variáveis de Ambiente

Criar `.env.example` com:

```env
WAKATIME_API_KEY=
DATABASE_URL=
DIRECT_URL=
```

Criar `.env.local` com:

```env
WAKATIME_API_KEY=sua_api_key_aqui
DATABASE_URL="postgresql://usuario:senha@host:porta/postgres"
DIRECT_URL="postgresql://usuario:senha@host:porta/postgres"
```

Regras:

- a API Key real deve ficar apenas no `.env.local`
- a DATABASE_URL real deve ficar apenas no `.env.local`
- a DIRECT_URL real deve ficar apenas no `.env.local`
- nunca commitar `.env.local`
- nunca expor a API Key no frontend
- usar a API Key apenas no backend/server-side
- usar DATABASE_URL apenas no backend/server-side
- usar DIRECT_URL apenas no backend/server-side e comandos Prisma

---

## Fonte

Dashboard WakaTime

↓

API WakaTime

↓

Backend WorkLog

↓

Supabase (PostgreSQL)

↓

Frontend

---

## Sincronização

Sempre que um projeto novo aparecer no WakaTime:

- verificar se já existe no banco
- caso não exista, criar automaticamente

Campos iniciais:

- nome
- wakatimeProjectName
- active = true

Campos pendentes:

- cliente
- valor por hora

O sistema deve registrar a data da última sincronização.

Projetos criados automaticamente devem aparecer como:

```txt
Pendente de Configuração
```

até que o usuário defina:

- cliente
- valor por hora

---

# Atualizações

## Automáticas

Cron diário.

## Sob demanda

Botão:

Atualizar Agora

Ao atualizar:

- buscar projetos do WakaTime
- atualizar horas
- criar projetos inexistentes
- registrar sincronização
- salvar última atualização

---

# Cálculo

## Horas WakaTime

Tempo registrado automaticamente pelo WakaTime.

---

## Horas Dedicadas

Tempo calculado com base nos registros manuais de trabalho.

---

## Diferença

Horas Dedicadas

-

Horas WakaTime

=

Tempo não registrado pelo WakaTime

---

## Valor Total

Horas Dedicadas

×

Valor Hora

=

Valor Total

---

## Valor Pendente

Valor Total

-

Pagamentos Recebidos

=

Valor Pendente

---

# Models sugeridos

## Client

Campos:

- id
- name
- email
- phone
- notes
- createdAt
- updatedAt

---

## Project

Campos:

- id
- clientId
- name
- hourlyRate
- wakatimeProjectName
- active
- configurationStatus
- lastSyncAt
- createdAt
- updatedAt

---

## WorkLogEntry

Campos:

- id
- projectId
- startedAt
- endedAt
- note
- createdAt
- updatedAt

---

## Payment

Campos:

- id
- projectId
- amount
- paidAt
- note
- createdAt
- updatedAt

---

## ShareLink

Campos:

- id
- projectId
- slug
- active
- createdAt
- updatedAt

---

## SyncLog

Campos:

- id
- syncedAt
- success
- message

Objetivo:

Registrar histórico de sincronizações com o WakaTime.

---

# Banco de Dados

Banco principal:

Supabase PostgreSQL

ORM:

Prisma ORM

Regras:

- Prisma deve ser responsável por todas as operações de banco
- Supabase será utilizado apenas como PostgreSQL gerenciado
- autenticação Supabase não é necessária neste momento
- toda comunicação deve passar pelo backend

---

# Direção Visual

O WorkLog deve ser visualmente simples, bonito e moderno.

Referência principal:

https://dennissnellenberg.com/

Inspirações adicionais:

- https://dribbble.com/tags/time-tracker
- https://dribbble.com/search/time-tracking-dashboard
- https://dribbble.com/search/dark-saas-dashboard
- https://dribbble.com/search/saas-project-management

Priorizar:

- dashboard SaaS moderno
- visual limpo e premium
- microinterações suaves
- elementos reagindo ao cursor de forma sutil
- botões com sensação interativa
- cards bem desenhados
- sidebar bonita
- gráficos simples
- tela de registros de trabalho fácil de usar
- portal compartilhável profissional

---

# Futuro

## V2

- Relatórios em PDF
- Filtros por período
- Exportação financeira
- Melhorias no portal compartilhável
- Histórico avançado de pagamentos

## V3

- Multiusuário
- Permissões por usuário
- Múltiplos workspaces
- Planos para uso futuro como produto
