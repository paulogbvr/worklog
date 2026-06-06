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

## 2026-06-05

### Descoberta

A configuração de projeto falhava somente na Vercel porque o Prisma Client de produção estava desatualizado em relação ao schema que adicionou `Project.notes`.

### Evidência

- a relação Cliente ↔ Projeto foi atualizada com sucesso dentro de uma transação Prisma
- a mesma rota retornou HTTP 200 em build local de produção
- a rota publicada retornou HTTP 500 com a mesma carga
- o dashboard já precisava tratar a leitura de `notes` como opcional
- o script de build executava apenas `next build`, sem regenerar explicitamente o Prisma Client

### Impacto

O cache de dependências da Vercel podia reutilizar um cliente gerado antes da mudança de schema. O campo `notes` era válido no banco, mas inválido para o cliente antigo.

### Ação

Executar `prisma generate` em todo `npm run build` e registrar códigos seguros de erro nas rotas.

---

## 2026-06-05

### Descoberta

O Prisma CLI continuava escolhendo a porta `6543` para migrations enquanto `directUrl` não estava declarada no datasource do schema.

### Evidência

- `DIRECT_URL` local apontava para a Session Pooler na porta `5432`
- `prisma migrate deploy` mostrava a porta `6543` e não concluía
- após declarar `directUrl = env("DIRECT_URL")`, o CLI usou `5432`
- a migration de dados cadastrais foi aplicada com sucesso

### Impacto

Ter a variável e carregá-la em `prisma.config.ts` não era suficiente para garantir a URL de migration neste fluxo.

### Ação

Manter `directUrl` explícita em `prisma/schema.prisma`.

---

## 2026-06-05

### Descoberta

A impossibilidade de desfazer a configuração de um projeto não vinha do schema: `clientId` e
`hourlyRate` já eram opcionais. A obrigatoriedade havia sido adicionada tanto pela validação nativa
do formulário quanto pelas validações do frontend e da rota.

### Evidência

- o select de cliente e o campo de valor tinham `required`
- o frontend bloqueava cliente vazio e valor menor ou igual a zero
- a rota rejeitava a mesma intenção antes de atualizar o Prisma
- ao remover essas barreiras, o projeto voltou para `PENDING` preservando `wakatimeProjectName`

### Impacto

Projetos pessoais ficavam presos a uma configuração financeira e podiam gerar cobrança indevida.

### Ação

Tratar cliente e cobrança como opcionais, normalizar vazio/zero para `null` e manter cálculo
financeiro apenas em projetos configurados.

---

## 2026-06-05

### Descoberta

O desalinhamento do card de ambiente no desktop era causado pela regra global
`.sidebar-expanded-only`, que aplica `display: flex`. Sem direção vertical explícita, título e lista
eram distribuídos na horizontal.

### Ação

Definir o card como `flex-col` e usar uma grade estável por linha, com nome truncável à esquerda e
status fixo à direita.

---

## 2026-06-05

### Descoberta

O model `WorkLogEntry` já suportava cada intervalo individual, mas não possuía uma identidade para
editar vários intervalos como uma única operação.

### Evidência

O banco continha 16 registros reais independentes. A migration adicionou `operationId`, usando o
próprio `id` como agrupamento inicial para todos os registros existentes.

### Impacto

O histórico foi preservado sem criar uma nova tabela e novas operações podem agrupar pausas.

### Ação

Persistir intervalos com `operationId` compartilhado e realizar criação/edição em transação.

---

## 2026-06-05

### Descoberta

O flicker do tema podia acontecer porque o script inicial aplicava a preferência correta, mas um
`useEffect` do shell reescrevia o DOM com o snapshot escuro usado na hidratação.

### Ação

Manter o script de pre-hydration como autoridade inicial, aplicar mudanças diretamente nos eventos
de storage e sincronizar também a meta `theme-color` e a safe-area móvel.

---

## 2026-06-05

### Descoberta

O enum `billingMode` não representava a regra real desejada porque impedia cobrar horas WakaTime e
horas dedicadas simultaneamente ou com tarifas diferentes.

### Evidência

O novo fluxo precisa aceitar WakaTime, dedicadas, ambas ou nenhuma fonte. Um único enum e uma única
tarifa não conseguem expressar essas quatro combinações.

### Impacto

O modelo foi simplificado para duas tarifas opcionais e um booleano para cobrança dedicada.

### Ação

Aplicar a migration `20260605203000_dual_billing_rates`, movendo a tarifa de projetos antigos em
modo `DEDICATED` para `dedicatedHourlyRate` antes de remover o enum.

---

## 2026-06-05

### Descoberta

As páginas públicas podem ser pré-renderizadas, mas o shell não deve depender de `useSearchParams`
para definir a navegação ativa.

### Evidência

O primeiro build das páginas `/flow`, `/installation` e `/about` foi interrompido pelo bailout de
client-side rendering provocado por `useSearchParams`.

### Impacto

Uma leitura de query desnecessária no shell transformava páginas estáticas em dependentes de
Suspense.

### Ação

Resolver a aba operacional no Server Component da home e passar apenas a informação necessária
para o shell.

---

## 2026-06-06

### Descoberta

As categorias “aprovados”, “marketing” e “administradores” não pertencem ao modelo de clientes do
WorkLog.

### Impacto

Persistir essas categorias criaria conceitos de CRM e permissões sem relação com horas,
faturamento ou pagamentos.

### Ação

A página de clientes usa indicadores derivados de dados reais: total, com projetos, com cobrança,
sem projeto e últimos cadastrados.

---

## 2026-06-06

### Descoberta

Validar apenas o status HTTP de uma página dinâmica com streaming não garante que todos os efeitos
server-side do render tenham concluído.

### Evidência

No primeiro teste do portal público, o status `200` foi lido sem consumir o HTML. A contabilização
do acesso ainda estava em execução quando o banco foi consultado.

### Ação

Nos testes de páginas compartilhadas, consumir o corpo completo antes de verificar `accessCount` e
notificações persistidas.

---

## 2026-06-06

### Descoberta

Persistir um arquivo por preview social ou por PDF compartilhável geraria duplicação sem benefício.

### Evidência

O App Router conseguiu servir a imagem Open Graph dinâmica e o `pdf-lib` gerou o relatório sob
demanda com HTTP 200.

### Impacto

Não é necessário criar colunas de imagem ou PDF nem limpar assets ao reativar links.

### Ação

Gerar ambos dinamicamente e persistir somente os eventos relacionados ao `ShareLink`.

---

## 2026-06-06

### Descoberta

A Clipboard API pode negar acesso em contextos automatizados ou restritos mesmo quando o botão foi
renderizado corretamente.

### Evidência

Uma chamada sem gesto real retornou falha; o clique real no mesmo botão copiou o conteúdo exato e
exibiu o toast esperado.

### Impacto

Copiar deve ter fallback de seleção temporária para navegadores que não liberem
`navigator.clipboard`.

### Ação

Centralizar a operação em `src/lib/clipboard.ts`.

---

## 2026-06-06

### Descoberta

O Supabase Storage ainda não está configurado no ambiente local atual.

### Impacto

Antes da correção, cadastro, edição e exclusão funcionavam, mas o input de comprovante ficava
desabilitado sem as variáveis opcionais.

### Ação

Resolvido com fallback PostgreSQL. O bucket privado `payment-receipts` continua recomendado para
produção, mas deixou de ser pré-requisito funcional.

---

## 2026-06-06

### Descoberta

O upload de comprovante ficava indisponível por decisão de interface quando as variáveis opcionais
do Storage não existiam.

### Impacto

Mesmo arquivos válidos não podiam ser selecionados, embora o restante do pagamento funcionasse.

### Ação

Usar Storage quando configurado e fallback binário privado no PostgreSQL, mantendo upload,
preview, download, substituição e exclusão no backend.

---

## 2026-06-06

### Descoberta

O badge público “Em andamento” era derivado apenas de `Project.active` e não representava a fase
real comunicada ao cliente.

### Ação

Separar status operacional, atividade WakaTime e configuração financeira. Persistir mudanças em
`ProjectStatusEvent` e exibi-las no histórico compartilhado.

---

# Regra

Sempre que uma descoberta relevante acontecer:

1. Registrar em FINDINGS.md
2. Avaliar impacto
3. Avaliar se gera nova decisão
4. Avaliar se gera nova tarefa
