# Skills Standards

## Purpose

Centralize global standards used by all project skills.
Use these rules as default when creating or updating files via automation scripts.

This document covers:
- Naming and structural conventions (TypeScript + Kotlin)
- DDD/Clean Architecture layer mapping
- Skill categorization and stack selection
- Documentation output standards

## 1. Naming Pattern

Default format for custom files:

- `<name-in-kebab-case>.<type>.<extension>`

Examples:

- `admin-shell.component.tsx`
- `shell.context.tsx`
- `shell.hook.ts`
- `customer.vo.ts`
- `customer.entity.ts`
- `customer.controller.ts`

Base rules:

- Folders: lowercase + kebab-case.
- Filenames: lowercase + kebab-case.
- Domain/module names: lowercase + kebab-case.

## 2. Recommended Type Suffixes

- UI component (React): `.component.tsx`
- App/feature page component: `.page.tsx`
- React context: `.context.tsx`
- Hook: `.hook.ts`
- Utility/helper: `.util.ts`
- DTO: `.dto.ts`
- Value object: `.vo.ts`
- Entity: `.entity.ts`
- Use case: `.use-case.ts`
- Repository: `.repository.ts`
- Query (CQRS): `.query.ts`
- Service: `.service.ts`
- Controller (Nest): `.controller.ts`
- Module (Nest): `.module.ts`
- Prisma model file: `.model.prisma`

## 3. Framework and Library Exceptions

Exceptions are allowed when naming is imposed by framework/library:

- Next.js App Router: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, etc.
- Tool entrypoints/config files that require fixed names.
- Imported/copied Shadcn component files can keep original upstream naming.

## 4. Structural Conventions

- Prefer feature/domain folders in kebab-case.
- Keep shared, reusable frontend artifacts under `src/shared` when applicable.
- Keep script output deterministic and idempotent.
- Keep imports by alias (`@/...`) when configured in the project.

## 5. Skill Authoring Rules

When editing any skill (`*/SKILL.md`):

- Reference this file (`./skills-standards.md`) as global standard source.
- Document explicit exceptions in the skill itself when needed.
- If a skill generates files via script, enforce this standard in generated paths.
- Every `SKILL.md` frontmatter must include `stack:` field (`typescript`, `kotlin`, or `agnostic`).

### Skill Categories

| Category | Prefix | Purpose | Stack |
|----------|--------|---------|-------|
| Config | `config-*` | Bootstrap/scaffolding de projeto, módulo ou infra | TS or KT |
| Core | `core-*` | Padrões de domínio e aplicação (entity, VO, use case) | TS or KT |
| Backend | `backend-*` | Camada de infraestrutura/interface do backend | TS or KT |
| Frontend | `frontend-*` | Camada de interface web | TS |
| Requisitos | `req-*` | Discovery e planejamento (DDD-aware, agnostic) | Agnostic |
| OpenSpec | `openspec-*` | Fluxo de proposta/exploração/implementação | Agnostic |

### Stack Suffix Convention

| Stack | Suffix | Framework | Automação |
|-------|--------|-----------|-----------|
| TypeScript | (none) | NestJS + Prisma + React | Templates + scripts |
| Kotlin | `-kt` | Spring Boot + JPA + Gradle | Templates + scripts |
| Language-agnostic | (none) | — | `req-discovery`, `req-agile-planning`, `openspec-*` |

### Source vs Target

The `req-discovery` skill can **read** systems in any language (PHP, Go, Python, Java, Ruby, etc.). The output is always structured in DDD/Clean Architecture, and the tasks in the agile planning always reference implementation skills from this repository (TypeScript or Kotlin).

## 6. Quick Examples (TypeScript)

- Backend controller: `apps/backend/src/modules/customer/customer.controller.ts`
- Backend module: `apps/backend/src/modules/customer/customer.module.ts`
- Frontend component: `apps/web/src/modules/customer/components/customer-dashboard.component.tsx`
- Frontend context: `apps/web/src/shared/context/shell.context.tsx`
- Frontend hook: `apps/web/src/shared/hooks/shell.hook.ts`
- Core entity: `packages/customer/core/src/entity/customer.entity.ts`
- Core VO: `packages/customer/core/src/vo/customer-name.vo.ts`

## 7. Kotlin Stack Standards

### Naming Pattern

Default format for Kotlin files:

- `<NameInPascalCase>.<extension>`

Base rules:

- Packages: lowercase dot-separated (`com.example.customer.domain.entity`).
- Directories: follow package structure (lowercase).
- Files: PascalCase matching the primary class/interface name.
- Skill directories: same kebab-case as TypeScript, with `-kt` suffix.

### Recommended Type Suffixes (Kotlin)

Kotlin files do not use dot-separated type suffixes in filenames. The type is expressed via the class name:

- Entity: `Customer.kt` (class `Customer`)
- Value Object: `CustomerName.kt` (value class or data class)
- Use Case: `CreateCustomerUseCase.kt` (class `CreateCustomerUseCase`)
- Repository interface: `CustomerRepository.kt` (interface `CustomerRepository`)
- Repository impl: `CustomerJpaRepository.kt` or `CustomerExposedRepository.kt`
- Query (CQRS): `FindCustomerByIdQuery.kt` (interface `FindCustomerByIdQuery`)
- DTO: `CustomerDTO.kt` (data class `CustomerDTO`)
- Service (domain): `CustomerPricingPolicy.kt`
- Controller: `CustomerController.kt` (`@RestController`)
- Spring module: `CustomerModule.kt` (`@Configuration`)
- JPA model: `CustomerJpaEntity.kt` (`@Entity @Table`)

### Structural Conventions (Kotlin)

- Prefer feature/domain packages: `com.<org>.<module>.domain`, `com.<org>.<module>.application`, `com.<org>.<module>.infrastructure`.
- Keep shared kernel under a dedicated module/package.
- Use `sealed class` or `sealed interface` for domain error hierarchies.
- Use `kotlin.Result` or Arrow `Either` for operation results.
- Use `@JvmInline value class` for lightweight Value Objects.
- Use `data class` for DTOs and Props.
- Spring Boot DI via constructor injection (no `@Autowired` on fields).
- Coroutines (`suspend fun`) for async operations when applicable.

### Quick Examples (Kotlin)

- Backend controller: `apps/backend-kt/src/main/kotlin/com/example/customer/infrastructure/web/CustomerController.kt`
- Core entity: `packages/customer/src/main/kotlin/com/example/customer/domain/entity/Customer.kt`
- Core VO: `packages/customer/src/main/kotlin/com/example/customer/domain/vo/CustomerName.kt`
- Core use case: `packages/customer/src/main/kotlin/com/example/customer/application/usecase/CreateCustomerUseCase.kt`
- Core repository: `packages/customer/src/main/kotlin/com/example/customer/domain/repository/CustomerRepository.kt`
- JPA adapter: `apps/backend-kt/src/main/kotlin/com/example/customer/infrastructure/persistence/CustomerJpaRepository.kt`
- DTO: `packages/customer/src/main/kotlin/com/example/customer/application/dto/CustomerDTO.kt`

## 8. DDD / Clean Architecture Standards

### Layer Model

All skills follow the same Clean Architecture layer model:

```
Interface (API/UI)   →  backend-controller[-kt], frontend-form-schema
Application          →  core-use-case[-kt], core-dto[-kt], core-query-cqrs[-kt]
Domain               →  core-entity[-kt], core-value-object[-kt], core-domain-service[-kt], core-repository[-kt]
Infrastructure       →  backend-prisma-data (TS) / backend-data-kt (KT), config-prisma (TS) / config-jpa-kt (KT)
```

### Implementation by Stack

| Layer | Concept | Skill TS | Skill KT |
|-------|---------|----------|----------|
| Domain | Entity | `core-entity` | `core-entity-kt` |
| Domain | Value Object | `core-value-object` | `core-value-object-kt` |
| Domain | Domain Service | `core-domain-service` | `core-domain-service-kt` |
| Domain | Repository port | `core-repository` | `core-repository-kt` |
| Application | Use Case | `core-use-case` | `core-use-case-kt` |
| Application | DTO | `core-dto` | `core-dto-kt` |
| Application | Query CQRS | `core-query-cqrs` | `core-query-cqrs-kt` |
| Infrastructure | Persistence adapter | `backend-prisma-data` | `backend-data-kt` |
| Infrastructure | Migration | `config-prisma` | `config-jpa-kt` |
| Interface | Controller | `backend-controller` | `backend-controller-kt` |
| Interface | Form | `frontend-form-schema` | — |

> The `req-discovery` skill reads systems in any language/architecture. The agile planning and implementation always use the skills above (TS or KT).

### DDD Concept → Skill Mapping

| DDD Concept | Skill (agnostic name) |
|-------------|----------------------|
| Bounded Context | `config-new-module` |
| Entity | `core-entity` |
| Value Object | `core-value-object` |
| Aggregate | `core-entity` (root entity) |
| Domain Service | `core-domain-service` |
| Repository (port) | `core-repository` |
| Repository (adapter) | `backend-prisma-data` / `backend-data-kt` |
| Use Case | `core-use-case` |
| DTO | `core-dto` |
| Query (CQRS) | `core-query-cqrs` |
| Controller | `backend-controller` |

### Implementation Order (inside-out)

When implementing a feature, follow this order:

1. `domain:vo` — Value Objects (validation)
2. `domain:entity` — Entity with VOs
3. `domain:service` — Domain Services (if needed)
4. `domain:repository` — Repository port (interface)
5. `app:dto` — DTOs (in/out contracts)
6. `app:usecase` — Use Case (orchestration)
7. `app:query` — Query CQRS (read model)
8. `infra:persistence` — Repository adapter
9. `infra:migration` — DB schema/migration
10. `interface:controller` — HTTP endpoint
11. `interface:form` — Frontend form (if applicable)
12. `test:unit` — Unit tests (domain + app)
13. `test:e2e` — End-to-end tests

### Task Type Prefixes (for Agile Planning)

Tasks in backlogs generated by `req-agile-planning` use these layer prefixes:

| Prefix | Layer | Examples |
|--------|-------|----------|
| `domain:vo` | Domain | Value Object creation |
| `domain:entity` | Domain | Entity with business rules |
| `domain:service` | Domain | Policy, calculator, validator |
| `domain:repository` | Domain | Repository interface |
| `app:dto` | Application | Input/output contracts |
| `app:usecase` | Application | Use case orchestration |
| `app:query` | Application | CQRS read query |
| `infra:persistence` | Infrastructure | DB adapter |
| `infra:migration` | Infrastructure | Schema, migration |
| `infra:setup` | Infrastructure | Project bootstrap |
| `infra:auth` | Infrastructure | Authentication setup |
| `infra:db` | Infrastructure | Database config |
| `interface:controller` | Interface | HTTP endpoint |
| `interface:form` | Interface | Frontend form |
| `test:unit` | Quality | Unit tests |
| `test:e2e` | Quality | End-to-end tests |

## 9. Documentation Output Standards

### Directory Convention

Skills that generate documentation (`req-discovery`, `req-agile-planning`) write to:

```
<projectRoot>/<docsPath>/
├── discovery/
│   └── <system-name>/
│       ├── requirements.md
│       ├── ddd-analysis.md
│       ├── screens.md
│       └── domain-model.md
└── planning/
    └── <project-name>/
        ├── backlog.md
        ├── epics-summary.md
        └── sprint-plan.md
```

### Configuration

`docsPath` is configured in `skills.config.json` → `defaults.docsPath` (default: `"docs"`).

### Pipeline

```
Sistema fonte           req-discovery        req-agile-planning     openspec-propose     openspec-apply-change
(qualquer linguagem) →  (leitura/análise) →  (planejamento DDD) →  (proposta change) →  (implementação TS/KT)
```

- **Entrada**: qualquer sistema (PHP MVC, Go, Python, Java, monolito, etc.)
- **Saída da discovery**: DDD/Clean Architecture (bounded contexts, entities, VOs, etc.)
- **Saída do planning**: backlog com tasks referenciando skills TS ou KT
- **Implementação**: sempre com os skills deste repositório — TS (sem sufixo) ou KT (sufixo `-kt`)
