# Tutorial 04 — Ciclo Completo com OpenSpec: do Legado ao Full-Stack

Agents usados: `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → `req-agile-planning` → `config-project-fullstack` → `openspec-propose` → `openspec-apply-change` → `openspec-archive-change`

**Cenário**: Sistema legado PHP/Laravel com módulos de Auth, Clientes e Pedidos será migrado para **NestJS** (backend) + **Vue 3 + PrimeVue** (frontend) + **Flutter** (mobile), usando OpenSpec para rastrear cada mudança.

## Como usar este tutorial

| Caminho | Quando | Passos |
|---------|--------|--------|
| **Modular** (recomendado) | Tutoriais focados por fase | [01 Análise](./01-pipeline-discovery-planning.md) → [02 Hub](./02-fullstack-project-setup.md) → [NestJS + Vue + Flutter](./stacks/nestjs-vue-flutter.md) — use **este doc** como referência OpenSpec (propose / apply / archive) |
| **Narrativa legado** | Walkthrough único do legado ao deploy | Siga as **Fases 1–3 abaixo** (se já fez o 01, pule a Fase 1) |

**Stack deste walkthrough**: NestJS + Vue 3 + Flutter — guia de implementação: [stacks/nestjs-vue-flutter.md](./stacks/nestjs-vue-flutter.md)

> Outras combinações legado (ex.: .NET + Angular + Android): [dotnet-angular-android](./stacks/dotnet-angular-android.md). Incremental só backend: [backend-incremental](./stacks/backend-incremental.md).

---

## Visão Geral do Ciclo

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CICLO COMPLETO COM OPENSPEC                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FASE 1 — ANÁLISE (agnóstico de linguagem)                              │
│                                                                          │
│  Legado PHP  →  req-discovery  →  req-ddd-modeling  →  req-migration   │
│                                                              strategy    │
│                                   backlog.md ←── req-agile-planning     │
│                                                                          │
│  FASE 2 — SETUP DO PROJETO (com Docker + CI/CD no bootstrap)            │
│                                                                          │
│  openspec-propose "bootstrap-loja-nova"                                  │
│       ↓                                                                  │
│  openspec-apply-change "bootstrap-loja-nova"                             │
│  ├── config-project-vue        → NestJS + Vue 3 + Tailwind + compose  │
│  ├── config-shared-web-vue     → shell admin (sidebar, topbar, rodapé)│
│  ├── config-project-flutter    → Flutter + Riverpod + Dio               │
│  ├── config-docker             → Dockerfiles multi-stage (produção)     │
│  ├── config-cicd               → GitHub Actions CI + CD                   │
│  └── config-shared-core        → shared DDD kernel                      │
│       ↓                                                                  │
│  openspec-archive-change "bootstrap-loja-nova"                           │
│                                                                          │
│  FASE 3 — IMPLEMENTAÇÃO (por épico/BC, com OpenSpec)                     │
│                                                                          │
│  Por cada épico do backlog.md:                                          │
│  openspec-propose "ep-XXX-<nome>"                                        │
│       ↓                                                                  │
│  openspec-apply-change "ep-XXX-<nome>"                                   │
│  ├── core-* / backend-* (domain + application + infra)                  │
│  ├── frontend-entity/usecase/repository/page/form (Vue)                 │
│  └── mobile-entity/usecase/repository/screen/form (Flutter)             │
│       ↓                                                                  │
│  openspec-archive-change "ep-XXX-<nome>"                                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1 — Análise do Legado

> Se já concluiu o [Tutorial 01 — Análise](./01-pipeline-discovery-planning.md), pule para a [Fase 2](#fase-2--setup-do-projeto).

### Etapa 1.1 — req-discovery

**Agent**: `req-discovery`

> Analise o sistema legado PHP/Laravel em `/projetos/loja-php`. Identifique os Bounded Contexts, entidades de domínio, regras de negócio e mapeamento para DDD/Clean Architecture. A nova implementação será em TypeScript (NestJS) com frontend Vue + PrimeVue e mobile Flutter.

**Saída** (em `docs/discovery/loja-php/`):

```
requirements.md
├── RF-001: Usuário pode criar conta com nome, email, senha
├── RF-002: Usuário faz login com email e senha (JWT)
├── RF-010: Sistema mantém cadastro de clientes (Customer)
├── RF-020: Sistema gerencia pedidos (Order com itens, status, total)
ddd-analysis.md
├── BC-001: Auth (Usuários)
├── BC-002: Customers (Clientes)
└── BC-003: Orders (Pedidos)
```

### Etapa 1.2 — req-ddd-modeling

**Agent**: `req-ddd-modeling`

> Aplique o Roadmap DDD sobre a análise em `docs/discovery/loja-php/ddd-analysis.md`. Gere o modelo estratégico (subdomínios, context map) e tático (entities, VOs, events) para os 3 BCs encontrados.

**Saída** (em `docs/modeling/loja-php/`):

```
ddd-strategic-model.md
├── Core Domain: Orders (diferencial competitivo)
├── Supporting: Customers
└── Generic: Auth
ddd-tactical-model.md
├── BC Auth: User entity, Email VO, Password VO (hash)
├── BC Customers: Customer entity, Name/Email/CPF VOs
└── BC Orders: Order aggregate, OrderItem, Money VO, OrderStatus VO
```

### Etapa 1.3 — req-migration-strategy

**Agent**: `req-migration-strategy`

> Defina a estratégia de migração do legado PHP para NestJS + Vue + Flutter. Usar o modelo tático em `docs/modeling/loja-php/ddd-tactical-model.md` como base.

**Saída**: `docs/migration/loja-php/migration-strategy.md`

```markdown
## Estratégia: Strangler Fig

### Sequência por Bounded Context
1. BC Auth (Generic) → migrar primeiro para desbloquear outros BCs
2. BC Customers (Supporting) → após Auth
3. BC Orders (Core) → último, maior complexidade

### Anti-Corruption Layer (ACL)
- Adapter entre API legada PHP e novo backend NestJS durante coexistência
```

### Etapa 1.4 — req-agile-planning

**Agent**: `req-agile-planning`

> Crie o backlog baseado no modelo tático em `docs/modeling/loja-php/` e na estratégia de migração. Stack: NestJS (TS) + Vue 3 + Flutter. Incluir tasks de frontend Vue e mobile Flutter para cada Bounded Context.

**Saída**: `docs/planning/loja-php/backlog.md` (trecho)

```markdown
## EP-000: [TECH] Bootstrap do Projeto

- [ ] `infra:setup` Setup projeto full-stack (~4h)
  - **Skill:** `config-project-fullstack`
  - **Prompt:** "Configure: backend NestJS, frontend Vue 3 + PrimeVue, mobile Flutter (Riverpod + Dio). Docker e CI/CD no bootstrap. Usar OpenSpec."

- [ ] `infra:docker` Dockerfiles multi-stage (~1h)
  - **Skill:** `config-docker`
- [ ] `infra:cicd` GitHub Actions CI + CD (~2h)
  - **Skill:** `config-cicd`

## EP-001: Auth e Usuários

- [ ] `domain:vo` Criar PasswordVO com hash bcrypt (~1h)
  - **Skill:** `core-value-object`
- [ ] `domain:entity` Criar User entity (~2h)
  - **Skill:** `core-entity`
- [ ] `app:usecase` LoginUseCase + RegisterUseCase (~3h)
  - **Skill:** `core-use-case`
- [ ] `interface:controller` AuthController POST /auth/login e /auth/register (~2h)
  - **Skill:** `backend-controller`
- [ ] `interface:form-web` LoginView e RegisterView Vue (~3h)
  - **Skills:** `frontend-entity-vue` → `frontend-usecase-vue` → `frontend-repository-vue` → `frontend-form-vue`
- [ ] `interface:mobile` LoginPage Flutter (~3h)
  - **Skills:** `mobile-entity-flutter` → `mobile-usecase-flutter` → `mobile-repository-flutter` → `mobile-screen-flutter`
- [ ] `test:unit` + `test:coverage` Testes domain+app ≥95% (~2h)
  - **Skill:** `test-unit`
- [ ] `test:e2e` Login API POST /auth/login (~2h)
  - **Skill:** `test-e2e`

## EP-002: Customers

- [ ] `test:unit` + `test:coverage` VOs, Customer entity, CreateCustomerUseCase ≥95% (~2h)
  - **Skill:** `test-unit`
- [ ] `test:e2e` POST /customers → GET /customers/:id (~2h)
  - **Skill:** `test-e2e`

## EP-003: Orders

[...tasks mais complexas para Orders BC...]
```

---

## Fase 2 — Setup do Projeto

### Etapa 2.1 — config-project-fullstack (planejamento)

**Agent**: `config-project-fullstack`

> Vamos criar o projeto "loja-nova". Decisões: Backend: NestJS (TypeScript), Frontend: Vue 3 + PrimeVue 4, Mobile: Flutter. Autenticação JWT básica será adicionada no EP-001. Docker e CI/CD fazem parte do bootstrap. Usar OpenSpec para rastrear mudanças.

**O agent responde com a sequência:**

```
1. Agent: openspec-propose
   Prompt: "Crie a mudança 'bootstrap-loja-nova' com proposta, design e tasks
            para setup NestJS + Vue + Flutter, incluindo config-docker e config-cicd."

2. Agent: openspec-apply-change "bootstrap-loja-nova"
   Tasks (em ordem):
   ├── config-project-vue      → monorepo NestJS + Vue 3 + PrimeVue + docker-compose dev
   ├── config-project-flutter  → app Flutter + Riverpod + Dio
   ├── config-docker           → Dockerfile multi-stage + docker-compose.prod.yml
   ├── config-cicd             → GitHub Actions CI + CD
   └── config-shared-core      → Entity, ValueObject, Result<T>, IUseCase, IRepository

3. Agent: openspec-archive-change "bootstrap-loja-nova"
```

### Etapa 2.2 — openspec-propose bootstrap

**Agent**: `openspec-propose`

> Crie a mudança "bootstrap-loja-nova" para documentar o setup do projeto com NestJS + Vue + Flutter, Prisma, shared kernel, Docker de produção e GitHub Actions.

**Artefatos em** `openspec/changes/bootstrap-loja-nova/`:

```markdown
<!-- proposal.md -->
# bootstrap-loja-nova

## O que
Setup inicial: monorepo NestJS + Vue + Flutter, infra de produção e CI/CD.

## Por que
Base necessária para implementar todos os BCs funcionais com entrega contínua desde o início.

## Escopo
- Backend NestJS com Prisma e Postgres (dev + prod)
- Frontend Vue 3 + PrimeVue com proxy Vite
- Mobile Flutter com Riverpod + Dio
- Shared kernel DDD
- Dockerfile multi-stage + docker-compose.prod.yml
- GitHub Actions (CI em PR, CD em main)
```

```markdown
<!-- tasks.md -->
- [ ] config-project-vue → monorepo + docker-compose dev
- [ ] config-project-flutter → app Flutter
- [ ] config-docker → Dockerfile multi-stage NestJS
- [ ] config-cicd → GitHub Actions CI + CD
- [ ] config-shared-core → kernel DDD
- [ ] config-prisma → schema inicial
```

### Etapa 2.3 — openspec-apply-change bootstrap

**Agent**: `openspec-apply-change`

> Implemente a mudança "bootstrap-loja-nova".

O apply executa as tasks na ordem do `tasks.md`, chamando cada skill de config.

**Estrutura resultante:**

```
loja-nova/
├── apps/
│   ├── backend/           ← NestJS + Prisma
│   ├── web-vue/           ← Vue 3 + PrimeVue 4 (Aura theme)
│   └── mobile-flutter/    ← Flutter + Riverpod + Dio
├── packages/
│   └── shared-core/       ← Entity, VO, Result
├── openspec/
│   └── changes/
│       └── bootstrap-loja-nova/
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── docker-compose.yml         ← dev (Postgres local)
├── docker-compose.prod.yml    ← produção
├── apps/backend/Dockerfile    ← multi-stage
└── .env
```

### Etapa 2.4 — openspec-archive-change bootstrap

**Agent**: `openspec-archive-change`

> Archive a mudança "bootstrap-loja-nova".

```
✓ bootstrap-loja-nova arquivado
  - 6/6 tasks completadas (inclui docker + cicd)
  - Duração: ~4h
```

---

## Fase 3 — EP-001: Auth via OpenSpec

### Etapa 3.1 — openspec-propose

**Agent**: `openspec-propose`

> Crie a mudança "ep-001-auth" com todas as tasks do EP-001 do backlog: VO Email, VO Password (bcrypt), entidade User, LoginUseCase, RegisterUseCase, AuthController (JWT), LoginView Vue, LoginPage Flutter, test:unit e test:e2e.

**tasks.md gerado** (em `openspec/changes/ep-001-auth/tasks.md`):

```markdown
- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
  - Skill: core-value-object

- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - Skill: core-entity

- [ ] `domain:repository` IUserRepository (port) (~30min)
  - Skill: core-repository

- [ ] `app:dto` LoginInputDto, RegisterInputDto, AuthOutputDto (~1h)
  - Skill: core-dto

- [ ] `app:usecase` LoginUseCase + RegisterUseCase (~3h)
  - Skill: core-use-case

- [ ] `infra:persistence` UserPrismaRepository (~2h)
  - Skill: backend-prisma-data

- [ ] `interface:controller` AuthController POST /auth/login e POST /auth/register (~2h)
  - Skill: backend-controller

- [ ] `interface:form-web` LoginView + RegisterView Vue (~3h)
  - Skills: frontend-entity-vue → frontend-usecase-vue → frontend-repository-vue → frontend-form-vue

- [ ] `interface:mobile` LoginPage Flutter (~3h)
  - Skills: mobile-entity-flutter → mobile-usecase-flutter → mobile-repository-flutter → mobile-screen-flutter

- [ ] `test:unit` + `test:coverage` User, VOs, LoginUseCase ≥95% (~2h)
  - Skill: test-unit

- [ ] `test:e2e` POST /auth/login (~2h)
  - Skill: test-e2e
```

### Etapa 3.2 — openspec-apply-change

**Agent**: `openspec-apply-change`

> Implemente a mudança "ep-001-auth".

O apply executa **task a task** na sequência inside-out:

```
Implementando ep-001-auth (11 tasks)

Task 1/11: domain:vo PasswordVO
  → skill core-value-object
  → Criado: packages/shared-core/src/vo/password.vo.ts
  ✓ Task completa

Task 2/11: domain:entity User
  → skill core-entity
  → Criado: packages/auth/core/src/entity/user.entity.ts
  ✓ Task completa

[... continua até task 8/11 ...]

Task 9/11: interface:mobile LoginPage Flutter
  → skills mobile-entity-flutter → mobile-screen-flutter
  → Criado: mobile-flutter/.../login_page.dart
  ✓ Task completa

Task 10/11: test:unit + test:coverage
  → skill test-unit
  ✓ Task completa

Task 11/11: test:e2e POST /auth/login
  → skill test-e2e
  ✓ Task completa

Progresso: 11/11 tasks completas
Pronto para arquivar. Use openspec-archive-change.
```

### Etapa 3.3 — openspec-archive-change

**Agent**: `openspec-archive-change`

> Archive a mudança "ep-001-auth".

```
✓ ep-001-auth arquivado
  - 11/11 tasks completadas
  - BCs cobertos: Auth (backend + frontend Vue + mobile Flutter)
  - Duração estimada: ~17h
```

---

## Fase 3 — EP-002: Customers (fluxo resumido)

O pattern do EP-001 se repete para o BC Customers:

```
1. openspec-propose "ep-002-customers"
   → tasks.md com: Name/Email/CPF VOs, Customer entity, CustomerRepository,
     CreateCustomerUseCase, GetCustomerByIdQuery, CustomerController,
     frontend-entity/usecase/repository/page/form (Vue),
     mobile-entity/usecase/repository/screen/form (Flutter),
     test:unit, test:coverage, test:e2e

2. openspec-apply-change "ep-002-customers"
   → chama skills na sequência inside-out

3. openspec-archive-change "ep-002-customers"
```

---

## Fase 3 — EP-003: Orders (fluxo resumido)

Orders é o Core Domain — mais complexo. O diferencial está no design:

```
openspec-propose "ep-003-orders"
```

O **proposal.md** deve descrever o agregado Order com cuidado:

```markdown
## Design de Orders

### Aggregate
- Order (aggregate root) com lista de OrderItem
- Money VO (valor + moeda, sem float)
- OrderStatus VO (enum: PENDING → CONFIRMED → SHIPPED → DELIVERED)

### Regras de negócio críticas
- Não é possível adicionar item a pedido confirmado
- Total = sum(item.price * item.quantity)
- Cancelamento só possível em PENDING
```

O tasks.md terá ~16 tasks cobrindo backend completo + listagem de pedidos no Vue + tela de pedidos no Flutter + testes.

---

## Anti-patterns a Evitar com OpenSpec

### 1. Mudança muito grande

```
❌ Errado: uma mudança "todo-o-projeto" com 50 tasks

✓ Certo: uma mudança por épico/BC, cada uma com 5-15 tasks
         bootstrap-loja-nova, ep-001-auth, ep-002-customers, ep-003-orders
```

### 2. Pular o openspec-propose

```
❌ Errado: chamar openspec-apply-change sem ter criado o proposal/tasks antes
           → sem rastreabilidade, sem design documentado

✓ Certo: sempre openspec-propose → revisar tasks.md → openspec-apply-change
```

### 3. Não arquivar mudanças completadas

```
❌ Errado: ep-001-auth completo mas não arquivado
           → polui a lista de changes "ativos"

✓ Certo: openspec-archive-change logo após o apply terminar
```

### 4. Usar OpenSpec para hotfixes urgentes

```
❌ Errado: criar uma mudança openspec para corrigir um bug urgente em produção

✓ Certo: hotfixes urgentes → skills diretos (core-entity, backend-controller, etc.)
         Registrar como débito técnico para documentação posterior
```

### 5. Adiar Docker/CI/CD para depois das features

```
❌ Errado: implementar todos os BCs e só então configurar Docker + CI/CD
           → sem feedback de build/deploy desde o início

✓ Certo: incluir config-docker e config-cicd na mudança bootstrap-loja-nova
         (conforme config-project-fullstack e [Hub Full-Stack](./02-fullstack-project-setup.md))
```

### 6. Pular camadas no frontend/mobile

```
❌ Errado: frontend-page-vue chamando HttpClient diretamente, sem entity/usecase/repository

✓ Certo: frontend-entity-vue → frontend-usecase-vue → frontend-repository-vue → frontend-page-vue
         (mesmo padrão Clean Architecture do backend)
```

---

## Resumo do Ciclo

| Fase | O que acontece | Skills |
|------|----------------|--------|
| Análise | Discovery + modelagem DDD + migração + planejamento | `req-*` |
| Setup | Bootstrap + Docker + CI/CD + shared kernel | `openspec-*` + `config-project-*` + `config-docker` + `config-cicd` + `config-shared-core` |
| Por BC | Propose → Apply (inside-out) → Archive | `openspec-*` + `core-*` + `backend-*` + `frontend-*` + `mobile-*` + `test-unit-*` + `test-e2e-*` |

**Regra de ouro**: uma mudança OpenSpec por Bounded Context/épico, cobrindo **todas as camadas daquele BC** (backend + frontend + mobile). O `openspec-apply-change` chama os skills certos na sequência correta.

---

> Voltar ao [índice de tutoriais](./README.md)

> Para projeto novo: [02 Hub Full-Stack](./02-fullstack-project-setup.md) → [NestJS + Vue + Flutter](./stacks/nestjs-vue-flutter.md).

> Backend incremental: [stacks/backend-incremental.md](./stacks/backend-incremental.md).
