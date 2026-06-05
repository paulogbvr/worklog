# WAKATIME_SYNC

## Objetivo

Definir como o WorkLog sincroniza projetos e horas reais do WakaTime.

Documentacao oficial:

```txt
https://wakatime.com/developers
```

Base API:

```txt
https://api.wakatime.com/api/v1/
```

---

# Regras

- usar `WAKATIME_API_KEY` apenas no backend
- nunca expor a chave no frontend
- nunca commitar `.env.local`
- salvar dados no Supabase via Prisma
- criar projetos automaticamente quando aparecerem no WakaTime
- marcar como inativos os projetos que desaparecerem da lista atual
- preservar todo o histórico de projetos inativos
- nao bloquear o dashboard quando a API falhar
- registrar cada tentativa em `SyncLog`

---

# Escopo do MVP

Sincronizar:

- projetos
- horas por projeto
- data da ultima sincronizacao

Nao sincronizar no MVP:

- linguagens
- editores
- categorias detalhadas
- atividades individuais

Esses dados podem ser uteis no futuro, mas nao respondem diretamente a regra de ouro do projeto.

---

# Fluxo Manual

Acao:

```txt
Atualizar Agora
```

Fluxo:

```txt
Frontend
↓
Route Handler server-side
↓
WakaTime API
↓
Prisma
↓
Supabase PostgreSQL
↓
Dashboard
```

Passos:

1. Criar `SyncLog` com inicio da tentativa.
2. Buscar projetos e resumos do WakaTime em paralelo.
3. Consultar em lote todos os projetos vinculados ao WakaTime.
4. Criar projetos ausentes em lote como ativos e `PENDING`.
5. Reativar projetos presentes e atualizar seus identificadores.
6. Marcar com `active = false` os projetos ausentes da lista atual.
7. Substituir o intervalo sincronizado dos projetos ativos com operacoes agregadas.
8. Atualizar `Project.lastSyncAt`.
9. Finalizar `SyncLog` com sucesso ou erro.

Estado atual:

```txt
Implementado
```

Arquivos:

- `src/server/wakatime/client.ts`
- `src/server/wakatime/sync.ts`
- `src/app/api/wakatime/sync/route.ts`
- `src/components/wakatime/sync-now-button.tsx`

Validação real:

```txt
6 projetos encontrados
6 projetos criados
15 registros diários sincronizados
84954 segundos importados
```

Validação após otimização:

```txt
2 projetos retornados pela API
5 registros diários sincronizados
0 novos projetos
4 projetos antigos arquivados
HTTP 200
```

As escritas em lote reduzem round trips e são preferíveis para uso com o Transaction Pooler do Supabase.

---

# Arquivamento de Projetos

A fonte do estado ativo é:

```txt
GET /users/current/projects
```

Regras:

- presente na lista atual: `active = true`
- ausente da lista atual: `active = false`
- nunca apagar automaticamente
- dashboard principal consulta apenas `active = true`
- horas e pagamentos de inativos permanecem no banco
- tela de arquivados pode ser criada futuramente

---

# Projetos Automaticos

Projeto novo vindo do WakaTime deve ser criado com:

```txt
active = true
configurationStatus = PENDING
clientId = null
hourlyRate = null
```

Campos que o usuario deve configurar depois:

- cliente
- valor por hora

---

# Periodo de Sincronizacao

Primeira sincronizacao:

```txt
ultimos 30 dias
```

Sincronizacoes seguintes:

```txt
desde a ultima sincronizacao, com pequena sobreposicao
```

A sobreposicao evita perder ajustes recentes do WakaTime.

---

# Sincronizacao Automatica

Nao implementar antes da sincronizacao manual estar estavel.

Opcao futura:

```txt
Vercel Cron
```

Frequencia inicial sugerida:

```txt
1 vez por dia
```

---

# Tratamento de Erros

Erros esperados:

- chave WakaTime ausente
- chave invalida
- API indisponivel
- limite de requisicoes
- resposta incompleta

Comportamento:

- registrar erro em `SyncLog`
- exibir mensagem amigavel
- manter dados antigos visiveis
- permitir nova tentativa manual

---

# Seguranca

- nenhuma rota deve devolver `WAKATIME_API_KEY`
- nenhuma variavel sensivel deve usar prefixo `NEXT_PUBLIC_`
- portal compartilhavel deve ser somente leitura
- telas administrativas precisam de protecao antes de deploy publico
