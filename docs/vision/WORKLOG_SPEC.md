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
- valor_hora_wakatime
- valor_hora_dedicada
- cobrar_horas_dedicadas
- wakatime_project_name
- repositorio_git
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
- possui ao menos uma tarifa cobrável positiva

Projeto pendente:

- foi criado automaticamente pelo WakaTime
- não possui cliente e/ou tarifa cobrável
- pode ser um projeto pessoal mantido intencionalmente sem cobrança

Projetos pendentes devem ser destacados no dashboard e não devem gerar valor financeiro.

---

### Registros de Trabalho

Campos:

- projeto
- intervalos de data_inicio e data_fim
- observacao

Regras:

- permitir múltiplos registros no mesmo dia
- permitir múltiplos intervalos dentro da mesma operação
- manter uma observação única por operação
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
- CPF/CNPJ
- data de nascimento
- endereço
- observacoes

Cada cliente pode possuir vários projetos.

Regras:

- CPF/CNPJ deve ser validado pelos dígitos verificadores
- CPF/CNPJ deve ser armazenado sem máscara
- idade deve ser calculada a partir da data de nascimento e não persistida

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

Cada projeto poderá:

- gerar um link não óbvio
- copiar e abrir o link
- desativar o compartilhamento
- contabilizar acessos

---

### Notificações

Eventos do MVP:

- sincronização concluída
- erro de sincronização
- novo link compartilhado
- projeto compartilhado acessado

Interface:

- badge na sidebar
- dropdown com não lidas e todas
- página completa
- marcação individual ou em lote como lida

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
- ao menos uma tarifa cobrável

O sistema deve registrar a data da última sincronização.

Projetos criados automaticamente devem aparecer como:

```txt
Pendente de Configuração
```

até que o usuário defina:

- cliente
- valor/hora WakaTime e/ou valor/hora dedicada habilitada

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

```txt
(Horas WakaTime × Valor/hora WakaTime)
+
(Horas Dedicadas × Valor/hora dedicada, quando habilitado)
=
Valor Total
```

Cada fonte pode ser cobrada de forma independente. Não usar fallback automático entre tarifas.

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
- taxId
- birthDate
- address
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
- dedicatedHourlyRate
- billDedicated
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
