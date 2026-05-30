# WORKLOG

Sistema para acompanhamento de horas trabalhadas, cálculo financeiro por projeto e compartilhamento transparente com clientes.

## Objetivo

Centralizar:

- projetos
- clientes
- horas trabalhadas
- valores acumulados
- pagamentos realizados
- valores pendentes

Utilizando o WakaTime como fonte oficial de rastreamento de tempo.

---

# Visão

Fluxo principal:

WakaTime

↓

Horas por Projeto

↓

Cálculo Financeiro

↓

Dashboard

↓

Portal do Cliente

↓

Histórico de Pagamentos

---

# Funcionalidades

## Dashboard Geral

Visualizar:

- horas totais
- valor total
- valor pendente
- valor recebido
- projetos ativos
- clientes ativos

---

## Projetos

Cada projeto possui:

- nome
- cliente
- valor por hora
- repositórios vinculados
- horas acumuladas
- valor acumulado
- valor recebido
- saldo pendente

---

## Clientes

Cada cliente possui:

- nome
- contato
- projetos
- horas totais
- pagamentos realizados
- saldo pendente

---

## Compartilhamento

Gerar links públicos.

Exemplo:

/share/core

/share/daliancas

/share/worklog

O cliente poderá visualizar:

- horas
- valor acumulado
- valor pago
- valor pendente
- última atualização

Sem acesso administrativo.

---

## Pagamentos

Registrar:

- data
- valor
- observações

O sistema recalcula automaticamente:

valor acumulado

-

valor recebido

=

valor pendente

---

## Integração WakaTime

Importar automaticamente:

- projetos
- horas
- atividades

Atualização:

- ao abrir dashboard
- atualização manual
- atualização agendada

---

# Stack

- Next.js
- TypeScript
- TailwindCSS
- Shadcn UI
- PostgreSQL
- Prisma ORM
- Vercel

---

# Referência Visual

Utilizar como inspiração:

https://daliancas-pagamentos.vercel.app/

Melhorar:

- UX
- compartilhamento
- clientes
- múltiplos projetos
- histórico
- pagamentos

---

# Status

Planejamento inicial.
