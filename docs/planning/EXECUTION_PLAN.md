# EXECUTION_PLAN

Plano de execução do WorkLog.

O objetivo é construir uma versão bonita, simples e funcional utilizando dados reais sempre que possível, com Supabase como banco PostgreSQL e WakaTime como fonte oficial de horas registradas em código.

---

## FASE 01

Criar projeto.

Direção para Codex:

Leia README.md e WORKLOG_SPEC.md.

Crie a estrutura inicial do projeto.

Não implementar autenticação.

Utilizar dados reais quando já houver variável de ambiente disponível.

Caso alguma variável esteja ausente, exibir aviso amigável e usar fallback controlado.

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

Configurar Ambiente.

Direção para Codex:

Criar e validar os arquivos de ambiente.

Criar `.env.example` com:

```env
WAKATIME_API_KEY=
DATABASE_URL=
```

Usar `.env.local` para as variáveis reais.

Variáveis reais necessárias:

```env
WAKATIME_API_KEY=
DATABASE_URL=
```

Regras:

- nunca commitar `.env.local`
- garantir que `.env.local` esteja no `.gitignore`
- usar `process.env.WAKATIME_API_KEY`
- usar `process.env.DATABASE_URL`
- nunca expor variáveis sensíveis no frontend

---

## FASE 03

Criar Banco com Supabase e Prisma.

Direção para Codex:

O banco PostgreSQL já foi criado no Supabase.

Utilize a variável:

```env
DATABASE_URL=
```

Implemente Prisma.

Criar models:

- Client
- Project
- WorkLogEntry
- Payment
- ShareLink

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
- projetos vindos do WakaTime podem nascer sem cliente e sem valor por hora
- projetos incompletos devem aparecer como pendentes de configuração

Rodar:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## FASE 04

Integração WakaTime.

Direção para Codex:

Implemente integração real com API do WakaTime.

Documentação oficial:

https://wakatime.com/developers

Criar:

- cliente server-side para WakaTime
- sincronização manual
- botão "Atualizar Agora"
- estrutura para sincronização automática futura
- tratamento de erro de autenticação
- fallback visual caso a API não responda
- salvamento dos dados sincronizados no Supabase via Prisma

Variável necessária:

```env
WAKATIME_API_KEY=
```

Regras:

- usar a API Key apenas no backend/server-side
- nunca expor a API Key no frontend
- nunca commitar `.env.local`
- buscar projetos reais no WakaTime
- buscar horas reais por projeto
- salvar última sincronização
- exibir erros de forma amigável

Regra principal:

Sempre que um projeto novo aparecer no WakaTime, criar automaticamente esse projeto no WorkLog caso ainda não exista.

Regra de criação automática:

- se `wakatimeProjectName` não existir no banco, criar novo Project
- marcar como ativo
- deixar cliente e valor por hora como pendentes
- exibir no dashboard como "pendente de configuração"

---

## FASE 05

Criar Dashboard.

Direção para Codex:

Implemente dashboard utilizando dados reais do banco e dados sincronizados do WakaTime.

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
- projetos pendentes de configuração

O dashboard deve apresentar uma visão geral simples e clara do WorkLog.

---

## FASE 06

Criar Projetos e Registros de Trabalho.

Direção para Codex:

Implemente a área de projetos.

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
- status de configuração

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
- salvar registros no Supabase via Prisma

---

## FASE 07

Pagamentos.

Direção para Codex:

Implemente a área de pagamentos.

Cada pagamento deve conter:

- projeto
- valor
- data
- observação

Regras:

- cada pagamento pertence a um projeto
- o valor recebido deve reduzir o valor pendente
- o histórico deve aparecer no projeto
- o histórico deve aparecer no portal compartilhável
- os dados devem ser salvos no Supabase via Prisma

---

## FASE 08

Portal Compartilhável.

Direção para Codex:

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

## FASE 09

Deploy.

Direção para Codex:

Preparar deploy Vercel.

Criar:

- documentação de ambiente
- `.env.example`
- instruções de deploy
- checklist de produção

Configurar na Vercel:

```env
WAKATIME_API_KEY=
DATABASE_URL=
```

Verificar:

- build
- lint
- typecheck
- variáveis de ambiente
- conexão com Supabase
- integração WakaTime
- Prisma
- portal compartilhável

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

## Supabase

Banco PostgreSQL já criado no Supabase.

Usar a connection string PostgreSQL no `.env.local`.

Adicionar no `.env.local`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.djuyxaznecfkwcjzkwlh.supabase.co:5432/postgres"
```

Adicionar no `.env.example`:

```env
DATABASE_URL=
```

Regras:

- trocar `SUA_SENHA` pela senha real do banco Supabase
- manter a `DATABASE_URL` real apenas no `.env.local`
- nunca commitar `.env.local`
- usar Prisma para conectar no Supabase

---

# Objetivo Final

Permitir acompanhamento simples, bonito e transparente de horas, faturamento e pagamentos por projeto e cliente.

O WorkLog deve mostrar:

- quanto tempo foi registrado pelo WakaTime
- quanto tempo foi dedicado manualmente ao projeto
- quais projetos vieram automaticamente do WakaTime
- quais projetos ainda estão pendentes de configuração
- quanto o projeto gerou financeiramente
- quanto já foi pago
- quanto ainda está pendente
- uma visão clara para o usuário
- uma visão compartilhável para o cliente
