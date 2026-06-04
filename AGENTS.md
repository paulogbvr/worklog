# WORKLOG — Codex Instructions

## Objetivo

Você está trabalhando no projeto WorkLog.

WorkLog é um sistema para acompanhar:

- horas trabalhadas
- projetos
- clientes
- pagamentos
- valores pendentes
- compartilhamento transparente com clientes

O sistema utiliza:

- WakaTime como fonte oficial de horas registradas em código
- Supabase PostgreSQL como banco principal
- Prisma ORM para acesso ao banco

---

# Fonte Principal de Navegação

Antes de procurar qualquer informação:

Consultar:

```txt
README.md
```

O README representa a visão geral oficial do projeto.

Quando houver conflito técnico específico, seguir primeiro as decisões registradas em `docs/project-memory/DECISIONS.md` e a stack em `docs/architecture/STACK.md`.

---

# Ordem de Leitura Obrigatória

Antes de qualquer alteração relevante:

1. README.md
2. AGENTS.md
3. docs/vision/WORKLOG_SPEC.md
4. docs/architecture/DATA_MODEL.md
5. docs/architecture/WAKATIME_SYNC.md
6. docs/planning/EXECUTION_PLAN.md
7. docs/project-memory/TASK_PLAN.md
8. docs/project-memory/PROGRESS.md
9. docs/project-memory/DECISIONS.md
10. docs/architecture/STACK.md
11. docs/references/LINKS.md
12. docs/project-memory/FINDINGS.md

Esses documentos são a fonte da verdade do projeto.

---

# Regra Principal

O WorkLog deve continuar simples.

Não transformar este projeto em:

- ERP
- CRM
- Agência
- CORE
- Sistema Operacional

Toda decisão deve responder:

```txt
Isso ajuda a acompanhar horas, projetos, pagamentos ou faturamento?
```

Se a resposta for não, não implementar agora.

---

# Escopo Atual

Prioridade atual:

1. Estrutura inicial
2. Prisma
3. Supabase
4. Integração WakaTime
5. Dashboard
6. Projetos automáticos
7. Registros de Trabalho
8. Pagamentos
9. Portal Compartilhável

---

# Banco de Dados

Banco oficial:

```txt
Supabase PostgreSQL
```

ORM oficial:

```txt
Prisma ORM
```

Variável:

```env
DATABASE_URL=
```

Regras:

- utilizar Prisma
- não utilizar Supabase Auth
- não utilizar Supabase Client no frontend
- toda comunicação deve passar pelo backend
- nunca expor DATABASE_URL

---

# WakaTime

Documentação:

```txt
https://wakatime.com/developers
```

Base API:

```txt
https://api.wakatime.com/api/v1/
```

Variável:

```env
WAKATIME_API_KEY=
```

Regras:

- usar API Key apenas no backend
- nunca expor API Key
- nunca commitar `.env.local`
- utilizar dados reais
- sincronizar projetos reais
- sincronizar horas reais

---

# Projetos Automáticos

Sempre que um projeto novo aparecer no WakaTime:

1. verificar existência
2. criar automaticamente se necessário
3. marcar como ativo
4. marcar como pendente de configuração

Status:

```txt
Pendente de Configuração
```

Campos pendentes:

- cliente
- valor por hora

---

# Registros de Trabalho

Cada registro possui:

- projeto
- início
- fim
- observação

Regras:

- múltiplos registros por dia
- edição posterior
- exclusão
- atravessar meia-noite
- recálculo automático

---

# Cálculo Financeiro

Fórmula:

```txt
Horas Dedicadas × Valor Hora = Valor Total
```

Depois:

```txt
Valor Total - Pagamentos Recebidos = Valor Pendente
```

---

# Documentação Viva

Após qualquer etapa importante:

Atualizar:

```txt
README.md
```

Atualizar:

```txt
docs/project-memory/PROGRESS.md
```

Atualizar quando necessário:

```txt
docs/project-memory/DECISIONS.md
```

Atualizar quando necessário:

```txt
docs/project-memory/TASK_PLAN.md
```

---

# Barra de Progresso

Sempre atualizar a barra do README.

Exemplo:

```txt
██████░░░░░░░░░░░░░░ 30%
```

---

# Direção Visual

Referência principal:

```txt
https://dennissnellenberg.com/
```

Objetivo:

- visual premium
- microinterações suaves
- elementos reagindo ao cursor
- sensação de profundidade
- dashboard moderno
- experiência memorável

Referências adicionais:

```txt
https://dribbble.com/tags/time-tracker
https://dribbble.com/search/time-tracking-dashboard
https://dribbble.com/search/dark-saas-dashboard
https://dribbble.com/search/saas-project-management
```

---

# Dependências Permitidas

UI:

- Shadcn UI

Animações:

- Motion

Validação:

- Zod

Formulários:

- React Hook Form

Tabelas:

- TanStack Table

Gráficos:

- Recharts

---

# Processo de Trabalho

Antes de implementar:

1. git status
2. ler README.md
3. ler AGENTS.md
4. ler WORKLOG_SPEC.md
5. ler DATA_MODEL.md
6. ler WAKATIME_SYNC.md
7. ler EXECUTION_PLAN.md
8. ler TASK_PLAN.md
9. explicar plano
10. implementar
11. validar
12. atualizar documentação

---

# Validações

Ao concluir:

```bash
npm run lint
npm run typecheck
npm run build
```

Se algum comando não existir, informar.

---

# Entrega Final

Sempre responder com:

- arquivos criados
- arquivos alterados
- o que foi implementado
- comandos executados
- erros encontrados
- próximos passos

---

# Regra de Ouro

Resolver o problema:

```txt
Saber quanto tempo foi trabalhado,
quanto isso vale,
quanto já foi pago,
e quanto ainda falta receber.
```

Nada além disso deve aumentar o escopo atual.
