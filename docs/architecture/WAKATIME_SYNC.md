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
2. Buscar projetos reais no WakaTime.
3. Para cada projeto, verificar se ja existe pelo identificador ou nome WakaTime.
4. Criar projeto ausente como ativo e `PENDING`.
5. Buscar horas por periodo.
6. Salvar horas agregadas por projeto e dia em `WakaTimeProjectDay`.
7. Atualizar `Project.lastSyncAt`.
8. Finalizar `SyncLog` com sucesso ou erro.

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
