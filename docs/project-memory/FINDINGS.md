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

# Regra

Sempre que uma descoberta relevante acontecer:

1. Registrar em FINDINGS.md
2. Avaliar impacto
3. Avaliar se gera nova decisão
4. Avaliar se gera nova tarefa
