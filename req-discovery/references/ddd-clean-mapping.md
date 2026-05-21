# DDD & Clean Architecture — Mapeamento para Skills

Este documento mapeia conceitos de DDD/Clean Architecture para os skills deste repositório.

**Premissa**: o sistema fonte pode ser qualquer linguagem/arquitetura (PHP MVC, Go, Python, Java, monolito, etc.). A **saída** é sempre DDD/Clean Architecture. A **implementação** usa sempre os skills deste repositório.

## Pipeline completo

```
Sistema fonte     req-discovery     req-ddd-modeling       req-migration-strategy   req-agile-planning     implementação
(qualquer)   ──▶  (leitura)    ──▶  (modelagem DDD)  ──▶  [opcional — legado]  ──▶  (backlog)        ──▶  config-project-fullstack
                  requirements.md   ddd-strategic-model.md  migration-strategy.md   backlog.md              + openspec-propose
                  ddd-analysis.md   ddd-tactical-model.md   acl-design.md           epics-summary.md        + openspec-apply-change
                                                                                                              + config-docker + config-cicd
                                                                                                              + core-* / backend-* / frontend-* / mobile-*
```

## Camadas da Clean Architecture → Skills

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           INTERFACE (API/UI)                            │
│  backend-controller[-kt|-cs]                                             │
│  frontend-entity/usecase/repository/page/form[-angular|-vue]             │
│  mobile-entity/usecase/repository/screen/form[-flutter|-android]         │
├──────────────────────────────────────────────────────────────────────────┤
│                          APPLICATION                                    │
│  core-use-case[-kt|-cs] · core-dto[-kt|-cs] · core-query-cqrs[-kt|-cs]  │
├──────────────────────────────────────────────────────────────────────────┤
│                            DOMAIN                                       │
│  core-entity[-kt|-cs] · core-value-object[-kt|-cs]                       │
│  core-domain-service[-kt|-cs] · core-repository[-kt|-cs]                │
├──────────────────────────────────────────────────────────────────────────┤
│                         INFRASTRUCTURE                                  │
│  backend-prisma-data / backend-data-kt / backend-data-cs                 │
│  config-prisma / config-jpa-kt / config-efcore-cs                       │
│  config-docker[-kt|-cs] · config-cicd[-kt|-cs]                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Conceitos DDD → Skills (backend)

| Conceito DDD | Skill TS | Skill KT | Skill CS |
|-------------|----------|----------|----------|
| **Bounded Context** | `config-new-module` | `config-new-module-kt` | `config-new-module-cs` |
| **Entity / Aggregate** | `core-entity` | `core-entity-kt` | `core-entity-cs` |
| **Value Object** | `core-value-object` | `core-value-object-kt` | `core-value-object-cs` |
| **Domain Service** | `core-domain-service` | `core-domain-service-kt` | `core-domain-service-cs` |
| **Repository (port)** | `core-repository` | `core-repository-kt` | `core-repository-cs` |
| **Use Case** | `core-use-case` | `core-use-case-kt` | `core-use-case-cs` |
| **DTO** | `core-dto` | `core-dto-kt` | `core-dto-cs` |
| **Query (CQRS)** | `core-query-cqrs` | `core-query-cqrs-kt` | `core-query-cqrs-cs` |
| **Repository (adapter)** | `backend-prisma-data` | `backend-data-kt` | `backend-data-cs` |
| **Controller** | `backend-controller` | `backend-controller-kt` | `backend-controller-cs` |
| **Bootstrap full-stack** | `config-project-fullstack` | (orquestrador agnóstico) | — |
| **Docker / CI/CD** | `config-docker` / `config-cicd` | `config-docker-kt` / `config-cicd-kt` | `config-docker-cs` / `config-cicd-cs` |

## Frontend e Mobile (Clean Architecture completa)

| Camada | Angular | Vue | Flutter | Android |
|--------|---------|-----|---------|---------|
| Domain | `frontend-entity-angular` | `frontend-entity-vue` | `mobile-entity-flutter` | `mobile-entity-android` |
| Application | `frontend-usecase-angular` | `frontend-usecase-vue` | `mobile-usecase-flutter` | `mobile-usecase-android` |
| Infrastructure | `frontend-repository-angular` | `frontend-repository-vue` | `mobile-repository-flutter` | `mobile-repository-android` |
| Presentation | `frontend-page-angular` + `frontend-form-angular` | `frontend-page-vue` + `frontend-form-vue` | `mobile-screen-flutter` + `mobile-form-flutter` | `mobile-screen-android` + `mobile-form-android` |

## Fluxo de Task por Funcionalidade

```
── BACKEND (inside-out) ─────────────────────────────────────
1. domain:vo → domain:entity → domain:service → domain:repository
2. app:dto → app:usecase → app:query
3. infra:persistence → infra:migration → interface:controller

── FRONTEND WEB ─────────────────────────────────────────────
4. interface:entity → interface:usecase → interface:repository
5. interface:page → interface:form-web

── MOBILE ───────────────────────────────────────────────────
6. interface:mobile-entity → interface:mobile-usecase → interface:mobile-repository
7. interface:mobile → interface:mobile-form

── QUALIDADE (meta ≥95% domain + application) ───────────────
8. test:unit → test:coverage → test:e2e
```

## Mapeamento de testes (Agent)

| Task | Agent TS | Agent KT | Agent CS |
|------|----------|----------|----------|
| `test:unit` / `test:coverage` | `Unit Tests (TypeScript)` | `Unit Tests (Kotlin)` | `Unit Tests (C#)` |
| `test:e2e` | `E2E Tests (TypeScript)` | `E2E Tests (Kotlin)` | `E2E Tests (C#)` |

## Notação de Task

Use sempre **Agent** (`display_name` do `agents/openai.yaml`) — nunca pasta de skill:

```markdown
- [ ] `domain:entity` Criar entidade Customer (~2h)
  - **Agent:** `Core Entity`
  - **Prompt:** "Crie a entidade Customer com VOs Name e Email. Aggregate root."

- [ ] `interface:entity` Customer entity frontend (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Entidade Customer com Result<T>."

- [ ] `infra:docker` Dockerfile multi-stage (~1h)
  - **Agent:** `Config Docker (TypeScript)`
  - **Prompt:** "Crie Dockerfile multi-stage + docker-compose.prod.yml."

- [ ] `test:unit` Testes entity + VOs + use case (~2h)
  - **Agent:** `Unit Tests (TypeScript)`
  - **Prompt:** "Mock repository; fluxo feliz e erros de negócio."
```

## OpenSpec no ciclo

| Momento | Mudança | Agents no apply |
|---------|---------|-----------------|
| Bootstrap | `bootstrap-<nome>` | Config Project (*), Config Shared Web (*), Config Docker, Config CI/CD, Config Shared Core |
| Por BC | `ep-XXX-<bc>` ou `bc-<nome>` | Core *, Backend *, Frontend *, Mobile *, Unit Tests, E2E Tests |
| Por feature UI | `feat-<nome>-<framework>` | Frontend Entity → Page/Form ou Mobile * |

## Escolha da Stack

| Stack | Skills | Framework |
|-------|--------|-----------|
| **TypeScript** | sem sufixo | NestJS + Prisma + Next.js/Angular/Vue |
| **Kotlin** | `-kt` | Spring Boot + JPA |
| **C#** | `-cs` | ASP.NET Core + EF Core |
| **Angular** | `-angular` | Angular 17+ + Tailwind + PrimeNG (widgets) |
| **Vue** | `-vue` | Vue 3 + Tailwind + PrimeVue |
| **Flutter** | `-flutter` | Flutter + Riverpod |
| **Android** | `-android` | Compose + Hilt |

## Bounded Contexts na Discovery

| Sinal no sistema fonte | Indica |
|------------------------|--------|
| Menu/seção separada na UI | Possível bounded context |
| Prefixo de rota (`/auth/*`, `/orders/*`) | Bounded context |
| Módulo/package/namespace separado | Bounded context explícito |

Cada Bounded Context → 1 Épico (`req-agile-planning`) → 1 mudança OpenSpec → 1 módulo (`config-new-module`).
