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

- calcular faturamento quando `billDedicated` estiver ativo e houver tarifa dedicada
- registrar reunioes, suporte, planejamento, documentacao e revisao
- complementar o que o WakaTime nao captura

Formula financeira oficial:

```txt
(Horas WakaTime x hourlyRate)
+
(Horas Dedicadas x dedicatedHourlyRate, quando billDedicated = true)
= Valor Total
Valor Total - Pagamentos Recebidos = Valor Pendente
```

Cada fonte é configurada de forma independente. Tarifa vazia ou zero não gera cobrança.

---

# Models Iniciais

## Client

Representa o cliente de um ou mais projetos.

Campos:

- id
- name
- email
- phone
- taxId opcional e unico
- birthDate opcional
- address opcional
- notes
- createdAt
- updatedAt

Regras:

- `taxId` armazena apenas digitos
- CPF e CNPJ devem ser validados antes da persistencia
- idade e sempre derivada de `birthDate`

## Project

Representa um projeto acompanhado no WorkLog.

Campos:

- id
- clientId opcional
- name
- notes opcional
- repositoryUrl opcional
- hourlyRate opcional para WakaTime
- dedicatedHourlyRate opcional
- billDedicated com padrão `false`
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
- projeto pessoal pode permanecer como `PENDING` sem cliente e sem cobrança
- projeto configurado deve ficar como `CONFIGURED`
- limpar cliente ou todas as tarifas cobráveis deve retornar o projeto para `PENDING`
- WakaTime gera cobrança quando `hourlyRate` for positivo
- horas dedicadas geram cobrança somente quando `billDedicated` estiver ativo e
  `dedicatedHourlyRate` for positivo
- projeto WakaTime ausente da lista atual deve ficar com `active = false`
- inativar não remove horas, pagamentos ou configuração
- repositório é apenas referência pública e deve usar URL HTTP/HTTPS válida

## WorkLogEntry

Representa um registro manual de trabalho.

Campos:

- id
- operationId
- projectId
- startedAt
- endedAt
- durationSeconds
- note
- createdAt
- updatedAt

Regras:

- permitir multiplos registros por dia
- intervalos da mesma operação compartilham `operationId` e `note`
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
- method
- note
- receiptPath opcional
- receiptName opcional
- receiptMimeType opcional
- createdAt
- updatedAt

Regras:

- comprovante fica em bucket privado e o banco armazena apenas a referência
- upload e download passam pelo backend
- excluir ou substituir comprovante tenta remover o objeto antigo do Storage
- pagamento continua funcionando sem Storage configurado

## ShareLink

Representa link publico somente leitura.

Campos:

- id
- projectId
- slug
- active
- accessCount
- lastAccessedAt
- createdAt
- updatedAt
- events

Regras:

- slug deve ser unico
- preferir slug nao obvio para evitar exposicao acidental
- portal nao pode permitir escrita
- cada acesso concluído incrementa `accessCount` e atualiza `lastAccessedAt`
- metadata e imagem Open Graph são dinâmicas, sem gerar arquivo por link
- excluir permanentemente um link remove eventos e notificações relacionados por cascade
- desativar preserva o histórico

## ShareEvent

Representa uma interação do cliente com o link público.

Campos:

- id
- shareLinkId
- type
- createdAt

Tipos:

- acesso
- cópia do link
- download do PDF

## Notification

Representa eventos relevantes para a operação pessoal do WorkLog.

Campos:

- id
- projectId opcional
- shareLinkId opcional
- type
- category
- title
- message
- readAt opcional
- createdAt

Regras:

- não armazenar dados sensíveis
- sincronização e compartilhamento não devem falhar se a notificação falhar
- leitura é controlada por `readAt`
- não criar infraestrutura de filas no MVP
- `IMPORTANT` entra no badge
- `UPDATE` registra atividade operacional sem poluir o contador

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

NotificationType:
- SHARE_ACCESSED
- SHARE_COPIED
- SHARE_CREATED
- SHARE_PDF_DOWNLOADED
- ENV_WARNING
- SYNC_SUCCESS
- SYNC_ERROR

NotificationCategory:
- IMPORTANT
- UPDATE

PaymentMethod:
- PIX
- CREDIT_CARD
- TED
- CASH
- BOLETO
- OTHER

ShareEventType:
- ACCESS
- COPY_LINK
- PDF_DOWNLOAD
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
Valor WakaTime = Horas WakaTime x Project.hourlyRate
Valor Dedicado = billDedicated
  ? Horas Dedicadas x Project.dedicatedHourlyRate
  : 0

Valor Total = Valor WakaTime + Valor Dedicado
```

## Desde o Ultimo Pagamento

```txt
ultimo pagamento = maior Payment.paidAt do projeto
horas desde o pagamento = registros a partir dessa data
```

Sem pagamento, considerar todo o histórico.

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
- relatorios financeiros PDF avançados
- exportacao financeira
- Stripe
- CRM
- ERP
