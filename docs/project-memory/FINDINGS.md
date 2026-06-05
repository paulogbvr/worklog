# FINDINGS

## Objetivo

Registrar descobertas técnicas, limitações, aprendizados e observações relevantes encontradas durante o desenvolvimento do WorkLog.

Nem toda descoberta é uma decisão.

Nem toda descoberta vira tarefa.

Mas descobertas importantes devem ser preservadas para evitar retrabalho futuro.

---

# Como Registrar

Formato:

```md
## YYYY-MM-DD

### Descoberta

Descrição da descoberta.

### Evidência

Como a descoberta foi encontrada.

### Impacto

O que muda no projeto.

### Ação

O que deve ser feito.
```

---

# Descobertas

## 2026-06-03

### Descoberta

O WakaTime será a principal fonte de horas registradas em código.

### Evidência

API oficial analisada e chave configurada.

### Impacto

Não será necessário criar um sistema próprio de rastreamento de tempo em código.

### Ação

Integrar WakaTime ao backend.

---

## 2026-06-03

### Descoberta

Nem todo tempo trabalhado é capturado pelo WakaTime.

### Evidência

Atividades como reuniões, planejamento, suporte e documentação normalmente não geram rastreamento automático.

### Impacto

As horas cobradas podem ser maiores que as horas registradas pelo WakaTime.

### Ação

Criar sistema de registros manuais de trabalho.

---

## 2026-06-03

### Descoberta

Projetos podem surgir automaticamente através do WakaTime.

### Evidência

O WakaTime identifica projetos sem necessidade de cadastro manual.

### Impacto

O sistema pode criar projetos automaticamente.

### Ação

Implementar sincronização automática de projetos.

---

## 2026-06-03

### Descoberta

Supabase atende perfeitamente o MVP inicial.

### Evidência

Banco PostgreSQL gerenciado já configurado.

### Impacto

Não é necessário trocar de banco para validação inicial.

### Ação

Utilizar Supabase PostgreSQL como infraestrutura principal.

---

## 2026-06-04

### Descoberta

O projeto ainda não possui aplicação Next.js inicializada.

### Evidência

Não existe `package.json` e os diretórios `src/`, `prisma/` e `public/` estão vazios.

### Impacto

A próxima etapa deve ser a fundação do app antes de Prisma, dashboard ou componentes.

### Ação

Inicializar Next.js com TypeScript, TailwindCSS e scripts de validação.

---

## 2026-06-04

### Descoberta

`AGENTS.md` e `CLAUDE.md` duplicavam praticamente as mesmas instruções.

### Evidência

Leitura comparativa dos dois arquivos.

### Impacto

Duplicidade poderia gerar divergência nas próximas sessões.

### Ação

Manter `AGENTS.md` como fonte oficial e reduzir `CLAUDE.md` a uma ponte legada.

---

## 2026-06-04

### Descoberta

O `next@16.2.7` depende internamente de `postcss@8.4.31`, que o `npm audit` marca com vulnerabilidade moderada.

### Evidência

`npm audit --omit=dev` reportou `GHSA-qx2v-qp2m-jg93` via `next/node_modules/postcss`.

### Impacto

Sem ajuste, o projeto ficaria com alerta de audit mesmo usando a versão atual do Next.

### Ação

Adicionar override de `postcss` para `8.5.15` em `package.json` e validar novamente.

Resultado:

```txt
found 0 vulnerabilities
```

---

## 2026-06-04

### Descoberta

O preview social estava vulnerável a cache externo porque a imagem Open Graph usava uma URL estável:

```txt
https://worklog-projects.vercel.app/og-image.png
```

### Evidência

O HTML de produção já continha as tags Open Graph e Twitter Card corretas, inclusive quando consultado com user-agents de Facebook e WhatsApp.

Também foi confirmado que:

- `og-image.png` respondia `200 OK`
- `favicon.ico` respondia `200 OK`
- não existiam arquivos automáticos `opengraph-image.*` ou `twitter-image.*`
- o App Router usava apenas `src/app/layout.tsx` como fonte de metadata social

### Impacto

WhatsApp e outros crawlers sociais podem continuar exibindo preview antigo ou fallback de favicon quando a página e a imagem social mantêm a mesma URL após ajustes.

### Ação

Versionar a imagem social para:

```txt
public/og-worklog-v3.png
```

---

## 2026-06-04

### Descoberta

O Prisma CLI não carregava `.env.local` automaticamente e a `DATABASE_URL` atual do Supabase usa o endpoint direto IPv6-only.

### Evidência

`npx prisma validate` falhou inicialmente por ausência de `DATABASE_URL` quando executado sem carregar `.env.local`.

Após criar `prisma.config.ts`, `npx prisma validate` e `npx prisma generate` passaram, mas `npx prisma migrate deploy` e `npx prisma db execute` falharam com:

```txt
P1001 Can't reach database server at db.djuyxaznecfkwcjzkwlh.supabase.co:5432
```

Diagnóstico DNS local:

```txt
A record: ausente
AAAA record: presente
TCP: ECONNREFUSED
```

### Impacto

A migration inicial existe e está validada, mas não pode ser aplicada ao Supabase a partir deste ambiente enquanto a conexão usar apenas o endpoint direto IPv6-only.

### Ação

Usar `DIRECT_URL` com a Session Pooler do Supabase para Prisma CLI/migrations em ambiente IPv4-only, ou aplicar a migration em ambiente com IPv6 disponível.

---

## 2026-06-04

### Descoberta

A sincronização manual real do WakaTime funcionou de ponta a ponta.

### Evidência

A rota `POST /api/wakatime/sync` foi executada localmente contra WakaTime e Supabase com sucesso.

Resultado:

```txt
6 projetos encontrados
6 projetos criados
15 registros diários sincronizados
84954 segundos importados
```

### Impacto

O WorkLog já consegue criar projetos automaticamente e persistir horas reais agregadas por projeto e dia.

### Ação

Avançar para dashboard real completo e tela de projetos pendentes de configuração.

---

## 2026-06-05

### Descoberta

O Prisma Client de runtime acessa o Supabase pelo Transaction Pooler, mas o schema engine usado por alguns comandos de migration não se comportou de forma confiável neste ambiente.

### Evidência

- a aplicação consultou e atualizou o banco normalmente
- a porta direta respondeu em teste de rede
- `prisma migrate deploy` pelo Transaction Pooler ficou sem concluir
- a conexão direta pelo schema engine retornou erro genérico
- a migration de `Project.notes` foi aplicada com o SQL exato e registrada em `_prisma_migrations` dentro de uma transação Prisma
- a coluna foi consultada com sucesso pela aplicação depois da operação

### Impacto

Falha do schema engine não significa necessariamente indisponibilidade do banco para o runtime. Migrations futuras precisam ser verificadas separadamente do tráfego normal da aplicação.

### Ação

Preferir uma URL de migration compatível com Prisma CLI. Caso o schema engine continue falhando, investigar a conexão do Supabase antes de aplicar qualquer procedimento manual e manter o histórico `_prisma_migrations` consistente.

---

## 2026-06-05

### Descoberta

A sincronização WakaTime pode ser persistida em lote sem consultas repetidas por projeto e dia.

### Evidência

A implementação passou a:

- buscar projetos e resumos em paralelo
- consultar projetos existentes uma vez
- criar projetos ausentes com `createMany`
- substituir o intervalo diário com `deleteMany` e `createMany`
- finalizar projetos e `SyncLog` em transação

Uma sincronização repetida concluiu com HTTP 200 em aproximadamente 3,4 segundos.

### Impacto

Menos round trips e menor risco de esgotar conexões no Transaction Pooler do Supabase.

### Ação

Manter operações de sincronização agregadas e evitar `upsert` individual em loops.

---

## 2026-06-05

### Descoberta

A API atual de projetos do WakaTime retornou apenas `worklog` e `core`, mas quatro projetos antigos continuavam ativos no WorkLog.

### Evidência

Antes da correção:

```txt
API WakaTime: 2 projetos
Dashboard WorkLog: 6 projetos ativos
```

Depois da comparação e arquivamento:

```txt
2 projetos ativos
4 projetos arquivados
lista principal: worklog e core
```

### Impacto

Sincronizar horas sem reconciliar o estado dos projetos deixa itens removidos aparecendo indefinidamente.

### Ação

Usar a lista atual de `/users/current/projects` como fonte do estado `active`, preservando projetos ausentes como histórico inativo.

---

## 2026-06-05

### Descoberta

A sincronização de produção gravava corretamente no Supabase, mas o dashboard convertia qualquer falha de uma das consultas concorrentes em um resumo totalmente vazio.

### Evidência

- `POST /api/wakatime/sync` em produção retornou 2 projetos e 5 registros diários
- o `SyncLog` retornado existia no mesmo banco consultado localmente
- `worklog` e `core` estavam ativos e com horas persistidas
- a página continuava exibindo zero porque quatro leituras Prisma estavam agrupadas em um `Promise.all`
- o `catch` externo descartava todos os resultados e retornava o estado de banco indisponível

### Impacto

Uma falha transitória ou contenção do Transaction Pooler em uma consulta auxiliar escondia dados válidos e fazia uma sincronização bem-sucedida parecer ineficaz.

### Ação

- normalizar os parâmetros de runtime do Transaction Pooler
- executar a consulta crítica de projetos ativos separadamente
- tratar clientes, observações, pagamentos e último sync com fallback isolado
- registrar apenas o código/tipo seguro do erro, sem URL ou segredo
- revalidar e atualizar a página depois da sincronização

---

## 2026-06-05

### Descoberta

O Open Graph publicado já apontava para uma imagem absoluta de 1200 × 630, separada do favicon. A permanência de previews antigos é compatível com cache dos indexadores sociais.

### Evidência

- tags `openGraph.images` e `twitter.images` estavam presentes
- imagem e favicon respondiam com HTTP 200
- o arquivo publicado correspondia ao asset local

### Impacto

Alterar somente a imagem mantendo a mesma URL pode não renovar imediatamente o preview em serviços externos.

### Ação

Versionar a URL do asset como `og-worklog-v5.png`, preservando dimensões e identidade visual.

---

# Regra

Sempre que uma descoberta relevante acontecer:

1. Registrar em FINDINGS.md
2. Avaliar impacto
3. Avaliar se gera nova decisão
4. Avaliar se gera nova tarefa
