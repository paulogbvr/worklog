# EXECUTION_PLAN

Plano de execução do WorkLog.

O objetivo é construir primeiro uma versão bonita, simples e funcional usando dados mockados, antes de avançar para banco, integrações reais e deploy.

---

## FASE 01

Criar projeto.

Prompt Claude:

Leia README.md e WORKLOG_SPEC.md.

Crie a estrutura inicial do projeto.

Não implementar integrações reais.

Não implementar autenticação.

Utilizar dados mockados.

Criar uma base visual bonita, moderna e bem organizada.

Referências visuais:

- https://dennissnellenberg.com/
- https://dribbble.com/tags/time-tracker
- https://dribbble.com/search/time-tracking-dashboard
- https://dribbble.com/search/dark-saas-dashboard
- https://dribbble.com/search/saas-project-management

Direção visual:

- dashboard SaaS moderno
- visual limpo e premium
- microinterações suaves
- botões com sensação interativa
- elementos reagindo sutilmente ao cursor
- cards bem desenhados
- sidebar bonita
- transições fluidas
- experiência simples e memorável

---

## FASE 02

Criar Dashboard.

Prompt Claude:

Implemente dashboard utilizando dados mockados.

Criar:

- cards
- projetos
- clientes
- pagamentos
- indicadores
- horas WakaTime
- horas dedicadas
- valor recebido
- valor pendente
- última atualização

O dashboard deve apresentar uma visão geral simples e clara do WorkLog.

---

## FASE 03

Criar Projetos e Registros de Trabalho.

Prompt Claude:

Implemente a área de projetos utilizando dados mockados.

Cada projeto deve exibir:

- nome
- cliente
- valor por hora
- nome do projeto no WakaTime
- horas registradas pelo WakaTime
- horas dedicadas manualmente
- diferença entre horas dedicadas e horas WakaTime
- valor acumulado
- valor recebido
- saldo pendente

Criar também a área de Registros de Trabalho.

Cada registro deve conter:

- data
- horário de início
- horário de término
- observação opcional

Regras:

- permitir adicionar múltiplos registros no mesmo dia
- permitir editar registros já cadastrados
- permitir remover registros
- permitir registros atravessando meia-noite
- recalcular automaticamente as horas dedicadas
- recalcular automaticamente o valor acumulado

Ainda não usar banco de dados.

Utilizar dados mockados.

---

## FASE 04

Criar Banco.

Prompt Claude:

Implemente Prisma.

Criar models:

- Project
- Client
- Payment
- ShareLink
- WorkLogEntry

O model WorkLogEntry deve representar os registros manuais de trabalho.

Campos sugeridos:

- id
- projectId
- startedAt
- endedAt
- note
- createdAt
- updatedAt

Regras:

- um projeto pode ter vários registros de trabalho
- um projeto pertence a um cliente
- um projeto pode ter vários pagamentos
- um projeto pode ter um link público de compartilhamento

---

## FASE 05

Integração WakaTime.

Prompt Claude:

Implemente integração com API do WakaTime.

Documentação oficial:

https://wakatime.com/developers

Criar:

- configuração via variável de ambiente
- `.env.example`
- cliente server-side para WakaTime
- sincronização manual
- estrutura para sincronização automática futura
- tratamento de erro de autenticação
- fallback visual caso a API não responda

Variáveis necessárias:

```env
WAKATIME_API_KEY=
```

Regras:

- usar a API Key apenas no backend/server-side
- nunca expor a API Key no frontend
- nunca commitar `.env.local`
- manter dados mockados como fallback durante desenvolvimento

---

## FASE 06

Portal Compartilhável.

Prompt Claude:

Implemente links públicos de visualização.

Exemplo:

- /share/projeto-exemplo
- /share/daliancas
- /share/worklog

O portal deve ser somente leitura.

O cliente poderá visualizar:

- projeto
- cliente
- horas registradas pelo WakaTime
- horas dedicadas manualmente
- valor acumulado
- valor recebido
- valor pendente
- histórico de pagamentos
- última atualização

Não permitir edição no portal público.

---

## FASE 07

Deploy.

Prompt Claude:

Preparar deploy Vercel.

Criar:

- documentação de ambiente
- `.env.example`
- instruções de deploy
- checklist de produção

Verificar:

- build
- lint
- typecheck
- variáveis de ambiente
- banco de dados
- integração WakaTime

---

# Credenciais Necessárias

## WakaTime

Criar conta:

https://wakatime.com

Gerar API Key.

Documentação:

https://wakatime.com/developers

Adicionar no `.env.local`:

```env
WAKATIME_API_KEY=sua_api_key_aqui
```

Adicionar no `.env.example`:

```env
WAKATIME_API_KEY=
```

A API Key real deve ficar apenas no `.env.local`.

---

## Banco

PostgreSQL.

Exemplos:

- Neon
- Supabase
- Railway

Adicionar no `.env.local`:

```env
DATABASE_URL=
```

Adicionar no `.env.example`:

```env
DATABASE_URL=
```

---

# Objetivo Final

Permitir acompanhamento simples, bonito e transparente de horas, faturamento e pagamentos por projeto e cliente.

O WorkLog deve mostrar:

- quanto tempo foi registrado pelo WakaTime
- quanto tempo foi dedicado manualmente ao projeto
- quanto o projeto gerou financeiramente
- quanto já foi pago
- quanto ainda está pendente
- uma visão clara para o usuário
- uma visão compartilhável para o cliente
