# WORKLOG

Sistema para acompanhamento de horas trabalhadas, cálculo financeiro por projeto e compartilhamento transparente com clientes.

## Objetivo

Centralizar:

- projetos
- clientes
- horas trabalhadas
- registros manuais de trabalho
- valores acumulados
- pagamentos realizados
- valores pendentes

Utilizando o WakaTime como fonte oficial de rastreamento de tempo em código.

---

# Visão

Fluxo principal:

WakaTime

↓

Horas por Projeto

↓

Registros de Trabalho

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
- última atualização do WakaTime

---

## Projetos

Cada projeto possui:

- nome
- cliente
- valor por hora
- repositórios vinculados
- nome do projeto no WakaTime
- horas acumuladas pelo WakaTime
- horas dedicadas manualmente
- valor acumulado
- valor recebido
- saldo pendente
- status ativo/inativo

Além das horas importadas pelo WakaTime, cada projeto poderá possuir registros manuais de trabalho.

---

## Registros de Trabalho

Um registro contém:

- data
- horário de início
- horário de término
- observação opcional

Exemplos:

- reunião
- planejamento
- documentação
- suporte
- desenvolvimento
- ajustes
- revisão
- publicação

O usuário poderá adicionar múltiplos registros no mesmo dia.

Exemplo:

09:00 → 11:30

14:00 → 16:00

22:00 → 01:15

Os registros podem atravessar dias diferentes.

O sistema calculará automaticamente o tempo total dedicado ao projeto.

O usuário poderá editar, remover e adicionar novos registros mesmo após já ter realizado sincronizações anteriores.

O objetivo é registrar todo o tempo dedicado ao projeto, incluindo atividades que normalmente não são capturadas pelo WakaTime.

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

/share/projeto-exemplo

/share/daliancas

/share/worklog

O cliente poderá visualizar:

- horas registradas pelo WakaTime
- horas dedicadas ao projeto
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

Documentação oficial:

https://wakatime.com/developers

Base da API:

https://api.wakatime.com/api/v1/

Importar automaticamente:

- projetos
- horas
- atividades
- linguagens
- editores
- tempo por projeto

Atualização:

- ao abrir dashboard
- atualização manual
- atualização agendada

Regras:

- usar a API Key apenas no backend/server-side
- nunca expor a API Key no frontend
- tratar erros de autenticação
- manter fallback com dados mockados enquanto a integração estiver em desenvolvimento

---

## Variáveis de Ambiente

Criar um arquivo `.env.local` na raiz do projeto.

Exemplo:

```env
WAKATIME_API_KEY=sua_api_key_aqui
```

Também criar um `.env.example` com:

```env
WAKATIME_API_KEY=
```

A API Key real deve ficar apenas no `.env.local`.

O `.env.local` não deve ser commitado.

---

## Controle de Tempo

O sistema deverá apresentar:

### Horas WakaTime

Tempo efetivamente registrado pelo WakaTime.

### Horas Dedicadas

Tempo calculado através dos registros de trabalho cadastrados manualmente.

### Diferença

Comparação entre:

- horas dedicadas
- horas registradas pelo WakaTime

Permitindo identificar tempo gasto em atividades fora da programação.

### Valor Financeiro

Horas Dedicadas

×

Valor Hora

=

Valor Total

---

# Direção Visual

O WorkLog deve ter aparência de dashboard SaaS moderno, limpo, premium e interativo.

Referência visual principal:

https://dennissnellenberg.com/

Usar como inspiração:

- movimento suave
- microinterações
- sensação de elementos reagindo ao cursor
- efeitos sutis de "grudar" no mouse
- transições fluidas
- interface viva, mas sem exagero
- experiência premium e memorável

Referências adicionais:

https://dribbble.com/tags/time-tracker

https://dribbble.com/search/time-tracking-dashboard

https://dribbble.com/search/dark-saas-dashboard

https://dribbble.com/search/saas-project-management

Priorizar:

- sidebar bonita
- cards bem desenhados
- gráficos simples
- boa hierarquia visual
- botões com microinterações
- tela de registros de trabalho fácil de usar
- portal compartilhável com aparência profissional

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

# Status

Planejamento inicial.
