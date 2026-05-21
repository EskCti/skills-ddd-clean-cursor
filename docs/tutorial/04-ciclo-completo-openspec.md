# Tutorial 04 — Ciclo Completo com OpenSpec: do Legado ao Full-Stack

Agents usados: `req-discovery` → `req-ddd-modeling` → `req-migration-strategy` → `req-agile-planning` → `config-project-fullstack` → `openspec-propose` → `openspec-apply-change` → `openspec-archive-change`

**Cenário**: Sistema legado PHP/Laravel com módulos de Auth, Clientes e Pedidos será migrado para **NestJS** (backend) + **Vue 3 + PrimeVue** (frontend) + **Flutter** (mobile), usando OpenSpec para rastrear cada mudança.

> **Formato de tasks**: em `backlog.md` e `tasks.md`, use sempre **Agent** (`display_name` do `agents/openai.yaml`) + **Prompt** — nunca pasta de skill (`core-entity`, `frontend-entity-vue`). Ver `req-agile-planning`.

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
│  ├── Core Value Object / Core Entity / Backend Controller (backend)     │
│  ├── Frontend Entity → UseCase → Repository → Page → Form (Vue)         │
│  └── Mobile Entity → UseCase → Repository → Screen → Form (Flutter)     │
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

- [ ] `infra:fullstack` Orquestrar setup completo (~1h)
  - **Agent:** `Config Project Full-Stack`
  - **Prompt:** "Configure: backend NestJS, frontend Vue 3 + Tailwind, mobile Flutter (Riverpod + Dio). Docker e CI/CD no bootstrap. Usar OpenSpec."

- [ ] `infra:setup` Bootstrap Vue monorepo (~2h)
  - **Agent:** `Config Project (Vue)`
  - **Prompt:** "Bootstrap monorepo NestJS + Vue 3 + docker-compose dev (Postgres)."

- [ ] `infra:shell-web` Shell admin Tailwind (~1h)
  - **Agent:** `Config Shared Web (Vue)`
  - **Prompt:** "Configure shell: sidebar colapsável, topbar, rodapé, dashboard vazio. Mescle rotas do shell."

- [ ] `infra:setup` Bootstrap Flutter (~2h)
  - **Agent:** `Config Project (Flutter)`
  - **Prompt:** "Configure app Flutter apontando para API local."

- [ ] `infra:docker` Dockerfiles multi-stage (~1h)
  - **Agent:** `Config Docker (TypeScript)`
  - **Prompt:** "Crie Dockerfile multi-stage + docker-compose.prod.yml."

- [ ] `infra:cicd` GitHub Actions CI + CD (~2h)
  - **Agent:** `Config CI/CD (TypeScript)`
  - **Prompt:** "CI em PR (lint + test + coverage ≥95% domain/app). CD em main (build Docker + deploy)."

- [ ] `domain:shared` Shared kernel DDD (~2h)
  - **Agent:** `Config Shared Core`
  - **Prompt:** "Configure Entity, ValueObject, Result<T>, IUseCase, IRepository."

- [ ] `infra:db` Prisma + Postgres (~1h)
  - **Agent:** `Config Prisma`
  - **Prompt:** "Configure Postgres + schema inicial."

## EP-001: Auth e Usuários

- [ ] `domain:vo` Criar PasswordVO com hash bcrypt (~1h)
  - **Agent:** `Core Value Object`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt."

- [ ] `domain:entity` Criar User entity (~2h)
  - **Agent:** `Core Entity`
  - **Prompt:** "Crie User com Email e PasswordVO. Aggregate root."

- [ ] `domain:repository` IUserRepository (~30min)
  - **Agent:** `Core Repository`
  - **Prompt:** "Interface IUserRepository: create, findByEmail."

- [ ] `app:dto` LoginInputDto, RegisterInputDto, AuthOutputDto (~1h)
  - **Agent:** `Core DTO`
  - **Prompt:** "DTOs de login, registro e resposta com JWT."

- [ ] `app:usecase` LoginUseCase + RegisterUseCase (~3h)
  - **Agent:** `Core Use Case`
  - **Prompt:** "LoginUseCase valida credenciais; RegisterUseCase cria User e persiste."

- [ ] `infra:persistence` UserPrismaRepository (~2h)
  - **Agent:** `Backend Prisma Data`
  - **Prompt:** "Implemente IUserRepository com Prisma."

- [ ] `interface:controller` AuthController POST /auth/login e /auth/register (~2h)
  - **Agent:** `Backend Controller`
  - **Prompt:** "Endpoints JWT; usar LoginUseCase e RegisterUseCase."

- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser com Result<T>."

- [ ] `interface:usecase` LoginUseCase + RegisterUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "Use cases injetando IAuthRepository."

- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP para /auth/login e /auth/register; mapear DTOs."

- [ ] `interface:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Tela de login injetando LoginUseCase."

- [ ] `interface:form-web` RegisterView Vue (~2h)
  - **Agent:** `Frontend Form (Vue)`
  - **Prompt:** "Formulário de registro; exibe erros de Result."

- [ ] `interface:mobile-entity` AuthUser entity Flutter (~1h)
  - **Agent:** `Mobile Entity (Flutter)`
  - **Prompt:** "Entidade AuthUser Dart pura com sealed Result."

- [ ] `interface:mobile-usecase` LoginUseCase Flutter (~2h)
  - **Agent:** `Mobile UseCase (Flutter)`
  - **Prompt:** "LoginUseCase injetando IAuthRepository."

- [ ] `interface:mobile-repository` AuthRepositoryImpl Flutter (~2h)
  - **Agent:** `Mobile Repository (Flutter)`
  - **Prompt:** "Dio para /auth/login; catch → Failure."

- [ ] `interface:mobile` LoginPage Flutter (~2h)
  - **Agent:** `Mobile Screen (Flutter)`
  - **Prompt:** "Tela de login com Riverpod AsyncNotifier."

- [ ] `test:unit` + `test:coverage` Testes domain+app ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Testes de User, VOs e LoginUseCase; mock repository."

- [ ] `test:e2e` Login API POST /auth/login (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
  - **Prompt:** "Supertest POST /auth/login; Playwright no fluxo Vue se aplicável."

## EP-002: Customers

- [ ] `test:unit` + `test:coverage` VOs, Customer entity, CreateCustomerUseCase ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
- [ ] `test:e2e` POST /customers → GET /customers/:id (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
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
   ├── Config Project (Vue)           → monorepo NestJS + Vue 3 + docker-compose dev
   ├── Config Shared Web (Vue)      → shell admin Tailwind (sidebar, topbar, rodapé)
   ├── Config Project (Flutter)     → app Flutter + Riverpod + Dio
   ├── Config Docker (TypeScript)   → Dockerfile multi-stage + docker-compose.prod.yml
   ├── Config CI/CD (TypeScript)    → GitHub Actions CI + CD
   ├── Config Shared Core           → Entity, ValueObject, Result<T>, IUseCase, IRepository
   └── Config Prisma                → schema inicial Postgres

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
- [ ] `infra:setup` Bootstrap Vue monorepo (~2h)
  - **Agent:** `Config Project (Vue)`
  - **Prompt:** "Monorepo NestJS + Vue 3 + docker-compose dev."

- [ ] `infra:shell-web` Shell admin Tailwind (~1h)
  - **Agent:** `Config Shared Web (Vue)`
  - **Prompt:** "Sidebar, topbar, rodapé, dashboard vazio."

- [ ] `infra:setup` Bootstrap Flutter (~2h)
  - **Agent:** `Config Project (Flutter)`
  - **Prompt:** "App Flutter + Riverpod + Dio."

- [ ] `infra:docker` Dockerfiles multi-stage (~1h)
  - **Agent:** `Config Docker (TypeScript)`
  - **Prompt:** "Dockerfile multi-stage NestJS + docker-compose.prod.yml."

- [ ] `infra:cicd` GitHub Actions (~2h)
  - **Agent:** `Config CI/CD (TypeScript)`
  - **Prompt:** "CI em PR; CD em main."

- [ ] `domain:shared` Shared kernel DDD (~2h)
  - **Agent:** `Config Shared Core`
  - **Prompt:** "Entity, VO, Result<T>, IUseCase, IRepository."

- [ ] `infra:db` Prisma + Postgres (~1h)
  - **Agent:** `Config Prisma`
  - **Prompt:** "Schema inicial Postgres."
```

### Etapa 2.3 — openspec-apply-change bootstrap

**Agent**: `openspec-apply-change`

> Implemente a mudança "bootstrap-loja-nova".

O apply executa as tasks na ordem do `tasks.md`, acionando cada **Agent** listado.

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
  - 7/7 tasks completadas (inclui shell web, docker + cicd)
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
  - **Agent:** `Core Value Object`
  - **Prompt:** "Crie PasswordVO com Create() retornando Result<T> e hash bcrypt."

- [ ] `domain:entity` User entity com Email, PasswordVO (~2h)
  - **Agent:** `Core Entity`
  - **Prompt:** "Aggregate root User com Email e PasswordVO."

- [ ] `domain:repository` IUserRepository (port) (~30min)
  - **Agent:** `Core Repository`
  - **Prompt:** "Interface IUserRepository: create, findByEmail."

- [ ] `app:dto` LoginInputDto, RegisterInputDto, AuthOutputDto (~1h)
  - **Agent:** `Core DTO`
  - **Prompt:** "DTOs de login, registro e resposta JWT."

- [ ] `app:usecase` LoginUseCase + RegisterUseCase (~3h)
  - **Agent:** `Core Use Case`
  - **Prompt:** "LoginUseCase valida credenciais; RegisterUseCase cria User."

- [ ] `infra:persistence` UserPrismaRepository (~2h)
  - **Agent:** `Backend Prisma Data`
  - **Prompt:** "Implemente IUserRepository com Prisma."

- [ ] `interface:controller` AuthController POST /auth/login e POST /auth/register (~2h)
  - **Agent:** `Backend Controller`
  - **Prompt:** "Endpoints JWT usando LoginUseCase e RegisterUseCase."

- [ ] `interface:entity` AuthUser entity Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade AuthUser com Result<T>."

- [ ] `interface:usecase` LoginUseCase + RegisterUseCase Vue (~2h)
  - **Agent:** `Frontend UseCase (Vue)`
  - **Prompt:** "Use cases injetando IAuthRepository."

- [ ] `interface:repository` AuthHttpRepository Vue (~2h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP para /auth/login e /auth/register."

- [ ] `interface:page` LoginView Vue (~2h)
  - **Agent:** `Frontend Page (Vue)`
  - **Prompt:** "Tela de login injetando LoginUseCase."

- [ ] `interface:form-web` RegisterView Vue (~2h)
  - **Agent:** `Frontend Form (Vue)`
  - **Prompt:** "Formulário de registro; exibe erros de Result."

- [ ] `interface:mobile-entity` AuthUser entity Flutter (~1h)
  - **Agent:** `Mobile Entity (Flutter)`
  - **Prompt:** "Entidade AuthUser Dart pura."

- [ ] `interface:mobile-usecase` LoginUseCase Flutter (~2h)
  - **Agent:** `Mobile UseCase (Flutter)`
  - **Prompt:** "LoginUseCase injetando IAuthRepository."

- [ ] `interface:mobile-repository` AuthRepositoryImpl Flutter (~2h)
  - **Agent:** `Mobile Repository (Flutter)`
  - **Prompt:** "Dio para /auth/login."

- [ ] `interface:mobile` LoginPage Flutter (~2h)
  - **Agent:** `Mobile Screen (Flutter)`
  - **Prompt:** "Tela de login com Riverpod."

- [ ] `test:unit` + `test:coverage` User, VOs, LoginUseCase ≥95% (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Mock repository; fluxo feliz e erros."

- [ ] `test:e2e` POST /auth/login (~2h)
  - **Agent:** `E2E Tests (TypeScript)`
  - **Prompt:** "Supertest POST /auth/login."
```

### Etapa 3.2 — openspec-apply-change

**Agent**: `openspec-apply-change`

> Implemente a mudança "ep-001-auth".

O apply executa **task a task**, acionando o **Agent** de cada linha na sequência inside-out:

```
Implementando ep-001-auth (18 tasks)

Task 1/18: domain:vo PasswordVO
  → Agent: Core Value Object
  → Criado: packages/shared-core/src/vo/password.vo.ts
  ✓ Task completa

Task 2/18: domain:entity User
  → Agent: Core Entity
  → Criado: packages/auth/core/src/entity/user.entity.ts
  ✓ Task completa

[... continua até task 7/18 — Backend Controller ...]

Task 8/18: interface:entity AuthUser Vue
  → Agent: Frontend Entity (Vue)
  ✓ Task completa

Task 9/18: interface:usecase LoginUseCase Vue
  → Agent: Frontend UseCase (Vue)
  ✓ Task completa

[... tasks 10–12: Frontend Repository, Page, Form ...]

Task 13/18: interface:mobile-entity AuthUser Flutter
  → Agent: Mobile Entity (Flutter)
  ✓ Task completa

[... tasks 14–16: Mobile UseCase, Repository, Screen ...]

Task 17/18: test:unit + test:coverage
  → Agent: Unit Tests (TypeScript)
  ✓ Task completa

Task 18/18: test:e2e POST /auth/login
  → Agent: E2E Tests (TypeScript)
  ✓ Task completa

Progresso: 18/18 tasks completas
Pronto para arquivar. Use openspec-archive-change.
```

### Etapa 3.3 — openspec-archive-change

**Agent**: `openspec-archive-change`

> Archive a mudança "ep-001-auth".

```
✓ ep-001-auth arquivado
  - 18/18 tasks completadas
  - BCs cobertos: Auth (backend + frontend Vue + mobile Flutter)
  - Duração estimada: ~17h
```

---

## Fase 3 — EP-002: Customers (fluxo resumido)

O pattern do EP-001 se repete para o BC Customers:

```
1. openspec-propose "ep-002-customers"
   → tasks.md com: VOs, Customer entity, CreateCustomerUseCase, CustomerController,
     Frontend Entity/UseCase/Repository/Page/Form (Vue),
     Mobile Entity/UseCase/Repository/Screen/Form (Flutter),
     Unit Tests, E2E Tests — cada task com **Agent** + **Prompt**

2. openspec-apply-change "ep-002-customers"
   → aciona cada Agent na sequência inside-out

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

✓ Certo: hotfixes urgentes → agents diretos (`Core Entity`, `Backend Controller`, etc.)
         Registrar como débito técnico para documentação posterior
```

### 5. Adiar Docker/CI/CD para depois das features

```
❌ Errado: implementar todos os BCs e só então configurar Docker + CI/CD
           → sem feedback de build/deploy desde o início

✓ Certo: incluir `Config Docker (TypeScript)` e `Config CI/CD (TypeScript)` na mudança bootstrap-loja-nova
         (conforme config-project-fullstack e [Hub Full-Stack](./02-fullstack-project-setup.md))
```

### 6. Pular camadas no frontend/mobile

```
❌ Errado: frontend-page-vue chamando HttpClient diretamente, sem entity/usecase/repository

✓ Certo: Frontend Entity (Vue) → Frontend UseCase (Vue) → Frontend Repository (Vue) → Frontend Page (Vue)
         (mesmo padrão Clean Architecture do backend; uma task por camada, cada uma com seu Agent)
```

---

## Resumo do Ciclo

| Fase | O que acontece | Agents |
|------|----------------|--------|
| Análise | Discovery + modelagem DDD + migração + planejamento | Requirement Discovery, DDD Modeling, Migration Strategy, Agile Planning |
| Setup | Bootstrap + shell + Docker + CI/CD + shared kernel | openspec-* + Config Project (*) + Config Shared Web (*) + Config Docker + Config CI/CD + Config Shared Core |
| Por BC | Propose → Apply (inside-out) → Archive | openspec-* + Core * + Backend * + Frontend * + Mobile * + Unit Tests + E2E Tests |

**Regra de ouro**: uma mudança OpenSpec por Bounded Context/épico, cobrindo **todas as camadas daquele BC** (backend + frontend + mobile). O `tasks.md` deve listar **Agent** + **Prompt** por task (copiado do `backlog.md`). O `openspec-apply-change` aciona cada Agent na sequência correta.

---

> Voltar ao [índice de tutoriais](./README.md)

> Para projeto novo: [02 Hub Full-Stack](./02-fullstack-project-setup.md) → [NestJS + Vue + Flutter](./stacks/nestjs-vue-flutter.md).

> Backend incremental: [stacks/backend-incremental.md](./stacks/backend-incremental.md).
