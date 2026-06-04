# DATA_MODEL

## Objetivo

Definir o modelo de dados inicial do WorkLog.

O modelo deve responder apenas:

```txt
quanto tempo foi trabalhado,
quanto isso vale,
quanto ja foi pago,
e quanto ainda falta receber.
```

---

# Principios

- Usar Supabase PostgreSQL como banco oficial.
- Usar Prisma ORM para todo acesso ao banco.
- Nao usar Supabase Auth no MVP inicial.
- Nao usar Supabase Client no frontend.
- Usar `Decimal` para valores financeiros.
- Guardar datas em UTC e formatar para o usuario na interface.
- Manter o schema simples e evolutivo.

---

# Fontes de Horas

## Horas WakaTime

Horas registradas automaticamente em codigo.

Fonte:

```txt
WakaTime
```

Uso:

- evidenciar tempo de codigo
- criar projetos automaticamente
- comparar com horas dedicadas

## Horas Dedicadas

Horas registradas no WorkLog por meio de `WorkLogEntry`.

Uso:

- calcular faturamento
- registrar reunioes, suporte, planejamento, documentacao e revisao
- complementar o que o WakaTime nao captura

Formula financeira oficial:

```txt
Horas Dedicadas x Valor Hora = Valor Total
Valor Total - Pagamentos Recebidos = Valor Pendente
```

---

# Models Iniciais

## Client

Representa o cliente de um ou mais projetos.

Campos:

- id
- name
- email
- phone
- notes
- createdAt
- updatedAt

## Project

Representa um projeto acompanhado no WorkLog.

Campos:

- id
- clientId opcional
- name
- hourlyRate opcional
- wakatimeProjectId opcional
- wakatimeProjectName opcional
- active
- configurationStatus
- lastSyncAt
- createdAt
- updatedAt

Regras:

- projeto vindo do WakaTime pode nascer sem cliente
- projeto vindo do WakaTime pode nascer sem valor por hora
- projeto incompleto deve ficar como `PENDING`
- projeto configurado deve ficar como `CONFIGURED`

## WorkLogEntry

Representa um registro manual de trabalho.

Campos:

- id
- projectId
- startedAt
- endedAt
- durationSeconds
- note
- createdAt
- updatedAt

Regras:

- permitir multiplos registros por dia
- permitir atravessar meia-noite
- exigir `endedAt` maior que `startedAt`
- recalcular `durationSeconds` ao criar ou editar

## WakaTimeProjectDay

Representa horas WakaTime agregadas por projeto e dia.

Campos:

- id
- projectId
- date
- totalSeconds
- syncedAt

Regras:

- uma linha por projeto por dia
- usar upsert por `projectId + date`
- nao armazenar linguagens, editores ou atividades no MVP

## Payment

Representa pagamento recebido por projeto.

Campos:

- id
- projectId
- amount
- paidAt
- note
- createdAt

## ShareLink

Representa link publico somente leitura.

Campos:

- id
- projectId
- slug
- active
- createdAt
- updatedAt

Regras:

- slug deve ser unico
- preferir slug nao obvio para evitar exposicao acidental
- portal nao pode permitir escrita

## SyncLog

Representa historico de sincronizacoes.

Campos:

- id
- provider
- startedAt
- finishedAt
- success
- message

---

# Enums

```txt
ProjectConfigurationStatus:
- PENDING
- CONFIGURED

SyncProvider:
- WAKATIME
```

---

# Calculos

## Horas Dedicadas

```txt
soma de WorkLogEntry.durationSeconds
```

## Horas WakaTime

```txt
soma de WakaTimeProjectDay.totalSeconds
```

## Valor Total

```txt
Horas Dedicadas x Project.hourlyRate
```

## Valor Recebido

```txt
soma de Payment.amount
```

## Valor Pendente

```txt
Valor Total - Valor Recebido
```

---

# Fora do MVP

- multiusuario
- permissoes
- workspaces
- relatorios PDF
- exportacao financeira
- Stripe
- CRM
- ERP
