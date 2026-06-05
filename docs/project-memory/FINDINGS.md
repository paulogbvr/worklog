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

# Regra

Sempre que uma descoberta relevante acontecer:

1. Registrar em FINDINGS.md
2. Avaliar impacto
3. Avaliar se gera nova decisão
4. Avaliar se gera nova tarefa
