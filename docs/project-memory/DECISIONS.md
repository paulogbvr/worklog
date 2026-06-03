# DECISIONS

## 2026-06-03

### DECISION-001

#### Título

Banco de Dados Oficial

#### Decisão

O WorkLog utilizará Supabase PostgreSQL como banco oficial.

#### Motivo

- PostgreSQL robusto
- Fácil integração com Prisma
- Plano gratuito suficiente para validação inicial
- Escalável para futuras versões

#### Impacto

Toda persistência do sistema deve utilizar Supabase PostgreSQL.

---

### DECISION-002

#### Título

ORM Oficial

#### Decisão

O WorkLog utilizará Prisma ORM.

#### Motivo

- Excelente integração com PostgreSQL
- Migrations organizadas
- Tipagem forte com TypeScript
- Boa experiência de desenvolvimento

#### Impacto

Todo acesso ao banco deve ocorrer através do Prisma.

---

### DECISION-003

#### Título

Fonte Oficial das Horas

#### Decisão

O WakaTime será a fonte oficial das horas registradas em código.

#### Motivo

- Captura automática
- Baixa fricção
- Dados confiáveis
- Integração simples

#### Impacto

Horas registradas em código devem vir prioritariamente do WakaTime.

---

### DECISION-004

#### Título

Projetos Automáticos

#### Decisão

Projetos devem ser criados automaticamente quando detectados no WakaTime.

#### Motivo

Evitar cadastro manual de projetos.

#### Impacto

Sempre que um projeto novo aparecer no WakaTime:

- verificar existência
- criar automaticamente se necessário
- marcar como ativo
- marcar como pendente de configuração

---

### DECISION-005

#### Título

Projetos Pendentes de Configuração

#### Decisão

Projetos criados automaticamente podem existir sem cliente e sem valor por hora.

#### Motivo

Permitir sincronização automática sem bloquear o fluxo.

#### Impacto

Projetos recém sincronizados devem aparecer como:

```txt
Pendente de Configuração
```

até que o usuário defina:

- cliente
- valor por hora

---

### DECISION-006

#### Título

Registros Manuais

#### Decisão

O sistema permitirá registros manuais de trabalho.

#### Motivo

Nem todo trabalho é capturado pelo WakaTime.

Exemplos:

- reuniões
- planejamento
- suporte
- documentação
- revisão

#### Impacto

Horas Dedicadas podem ser maiores que Horas WakaTime.

---

### DECISION-007

#### Título

Deploy Oficial

#### Decisão

O sistema será hospedado na Vercel.

#### Motivo

- integração nativa com Next.js
- deploy simples
- plano gratuito suficiente para validação

#### Impacto

Toda configuração de produção deve considerar Vercel.

---

### DECISION-008

#### Título

Documentação Viva

#### Decisão

README.md deve ser atualizado após marcos importantes.

#### Motivo

Facilitar retomadas futuras e continuidade entre sessões.

#### Impacto

Ao concluir etapas relevantes:

- atualizar tabela de status
- atualizar barra de progresso
- atualizar próxima etapa

---

### DECISION-009

#### Título

Direção Visual

#### Decisão

A principal referência visual será:

```txt
https://dennissnellenberg.com/
```

#### Motivo

Experiência moderna, premium e altamente interativa.

#### Impacto

Priorizar:

- microinterações
- animações suaves
- sensação de elementos reagindo ao cursor
- experiência premium
- dashboard elegante

---

### DECISION-010

#### Título

Dados Reais

#### Decisão

O projeto deve utilizar dados reais sempre que possível.

#### Motivo

Validar o produto com uso real desde o início.

#### Impacto

Prioridade:

```txt
WakaTime
↓
Backend
↓
Supabase
↓
Frontend
```

Mocks devem ser utilizados apenas como fallback temporário.
