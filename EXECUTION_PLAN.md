# EXECUTION_PLAN

## FASE 01

Criar projeto.

Prompt Claude:

Leia README.md e WORKLOG_SPEC.md.

Crie a estrutura inicial do projeto.

Não implementar integrações.

Não implementar autenticação.

Utilizar dados mockados.

---

## FASE 02

Criar Dashboard.

Prompt Claude:

Implemente dashboard utilizando dados mockados.

Criar:

- cards
- projetos
- clientes
- pagamentos
- indicadores

---

## FASE 03

Criar Banco.

Prompt Claude:

Implemente Prisma.

Criar models:

- Project
- Client
- Payment
- ShareLink

---

## FASE 04

Integração WakaTime.

Prompt Claude:

Implemente integração com API do WakaTime.

Criar sincronização manual e automática.

---

## FASE 05

Portal Compartilhável.

Prompt Claude:

Implemente links públicos de visualização.

Somente leitura.

---

## FASE 06

Deploy.

Prompt Claude:

Preparar deploy Vercel.

Criar documentação de ambiente.

Criar .env.example.

---

# Credenciais Necessárias

## WakaTime

Criar conta:

https://wakatime.com

Gerar API Key.

Adicionar:

WAKATIME_API_KEY=

---

## Banco

PostgreSQL

Exemplo:

- Neon
- Supabase
- Railway

---

# Objetivo Final

Permitir acompanhamento completo de horas, faturamento e pagamentos por projeto e cliente.
