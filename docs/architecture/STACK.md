# STACK

## Objetivo

Este documento define a stack oficial do WorkLog.

Mudanças importantes de stack devem ser registradas em:

```txt
docs/project-memory/DECISIONS.md
```

---

# Frontend

Framework:

```txt
Next.js
```

Linguagem:

```txt
TypeScript
```

Estilização:

```txt
TailwindCSS
```

Gerenciador de pacotes:

```txt
npm
```

Componentes:

```txt
Shadcn UI
```

Ícones:

```txt
Lucide React
React Icons
```

Uso:

- Lucide para ações e navegação
- `FaCode` de React Icons como marca oficial do WorkLog

---

# Backend

Framework:

```txt
Next.js Route Handlers
```

Linguagem:

```txt
TypeScript
```

---

# Banco de Dados

Banco oficial:

```txt
Supabase PostgreSQL
```

Regras:

- utilizar PostgreSQL
- Supabase será utilizado apenas como banco gerenciado
- autenticação Supabase não será utilizada inicialmente

---

# ORM

ORM oficial:

```txt
Prisma ORM
```

Regras:

- toda comunicação com banco deve passar pelo Prisma
- evitar consultas SQL espalhadas pelo projeto
- centralizar acesso ao banco

---

# Rastreamento de Horas

Fonte oficial:

```txt
WakaTime
```

Documentação:

```txt
https://wakatime.com/developers
```

Regras:

- utilizar API oficial
- utilizar dados reais
- nunca expor API Key no frontend

---

# Deploy

Plataforma oficial:

```txt
Vercel
```

---

# Variáveis de Ambiente

Obrigatórias:

```env
WAKATIME_API_KEY=
DATABASE_URL=
```

Opcional para Prisma CLI/migrations:

```env
DIRECT_URL=
```

Regras:

- utilizar `.env.local`
- nunca commitar `.env.local`
- manter `.env.example` atualizado
- usar `DIRECT_URL` quando a `DATABASE_URL` de runtime não for adequada para migrations

---

# Estrutura Esperada

```txt
src/
prisma/
public/
docs/
```

Documentos complementares de arquitetura:

```txt
docs/architecture/DATA_MODEL.md
docs/architecture/WAKATIME_SYNC.md
```

---

# Bibliotecas Permitidas

UI:

- Shadcn UI

Animações:

- Motion

Formulários:

- React Hook Form

Validação:

- Zod

Tabelas:

- TanStack Table

Gráficos:

- Recharts

Implementação atual:

```txt
recharts 3.x
```

Uso:

- gráficos responsivos de horas
- gráficos de valor gerado e recebido
- composição visual inspirada no chart do Shadcn UI

---

# Bibliotecas Não Permitidas Sem Aprovação

Não instalar sem aprovação:

- Firebase
- MongoDB
- Supabase Auth
- Redux
- Zustand
- Stripe
- Clerk
- Auth0

---

# Filosofia

Priorizar:

- simplicidade
- legibilidade
- baixo acoplamento
- manutenção fácil
- tipagem forte

Evitar:

- abstrações prematuras
- dependências desnecessárias
- complexidade sem necessidade

---

# Fonte de Verdade

Quando houver conflito:

1. DECISIONS.md
2. STACK.md
3. README.md
4. Demais documentos
