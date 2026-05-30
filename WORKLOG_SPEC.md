# WORKLOG_SPEC

## MVP V1

### Dashboard

- horas totais
- valor total
- valor pendente
- valor recebido

---

### Projetos

Campos:

- nome
- cliente
- valor_hora
- wakatime_project_name
- ativo

---

### Clientes

Campos:

- nome
- email
- telefone
- observacoes

---

### Pagamentos

Campos:

- projeto
- valor
- data
- observacao

---

### Compartilhamento

Links públicos.

Exemplo:

/share/{slug}

---

# Integração WakaTime

## Necessário

Conta WakaTime

API Key

---

## Fonte

Dashboard WakaTime

↓

API WakaTime

↓

Backend Worklog

↓

Banco

↓

Frontend

---

# Atualizações

## Automáticas

Cron diário

## Sob demanda

Botão:

Atualizar Agora

---

# Cálculo

Horas Acumuladas

×

Valor Hora

=

Valor Total

Valor Total

-

Pagamentos Recebidos

=

Valor Pendente

---

# Futuro

## V2

- GitHub
- Commits
- Deploys
- Custos
- Notas fiscais
- PDF
- Relatórios

## V3

- Multiusuário
- Equipes
- Agência
- SaaS
