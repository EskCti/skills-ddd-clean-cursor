# Skills Standards

## Purpose

Centralize global standards used by all project skills.
Use these rules as default when creating or updating files via automation scripts.

This document covers:

- Naming and structural conventions (TypeScript + Kotlin + C#)
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
- Every `SKILL.md` frontmatter must include `stack:` field (`typescript`, `kotlin`, `csharp`, or `agnostic`).

### Skill Categories

| Category   | Prefix       | Purpose                                               | Stack        |
| ---------- | ------------ | ----------------------------------------------------- | ------------ |
| Config     | `config-*`   | Bootstrap/scaffolding de projeto, módulo ou infra     | TS, KT or CS |
| Core       | `core-*`     | Padrões de domínio e aplicação (entity, VO, use case) | TS, KT or CS |
| Backend    | `backend-*`  | Camada de infraestrutura/interface do backend         | TS, KT or CS |
| Frontend   | `frontend-*` | Camada de interface web                               | TS           |
| Requisitos | `req-*`      | Discovery, modelagem DDD e planejamento (agnostic)    | Agnostic     |
| OpenSpec   | `openspec-*` | Fluxo de proposta/exploração/implementação            | Agnostic     |

### Stack Suffix Convention

| Stack             | Suffix | Framework                  | Automação                                           |
| ----------------- | ------ | -------------------------- | --------------------------------------------------- |
| TypeScript        | (none) | NestJS + Prisma + React    | Templates + scripts                                 |
| Kotlin            | `-kt`  | Spring Boot + JPA + Gradle | Templates + scripts                                 |
| C#                | `-cs`  | ASP.NET Core + EF Core     | Templates + scripts                                 |
| Language-agnostic | (none) | —                          | `req-discovery`, `req-agile-planning`, `openspec-*` |

### Source vs Target

The `req-discovery` skill can **read** systems in any language (PHP, Go, Python, Java, Ruby, etc.). The output is always structured in DDD/Clean Architecture, and the tasks in the agile planning always reference implementation skills from this repository (TypeScript, Kotlin or C#).

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

## 8. C# Stack Standards

### Naming Pattern

Default format for C# files:

- `<NameInPascalCase>.<extension>`

Base rules:

- Namespaces: PascalCase dot-separated (`Project.Module.Domain.Entities`).
- Directories: follow namespace structure (PascalCase).
- Files: PascalCase matching the primary class/interface/record name.
- Skill directories: same kebab-case as TypeScript, with `-cs` suffix.

### Recommended Type Suffixes (C#)

C# files do not use dot-separated type suffixes in filenames. The type is expressed via the class name or interface prefix:

- Entity: `Customer.cs` (class/record `Customer`)
- Value Object: `CustomerName.cs` (record)
- Use Case: `CreateCustomerUseCase.cs` (class)
- Repository interface: `ICustomerRepository.cs` (interface)
- Repository impl: `CustomerRepository.cs` (entity framework/dapper)
- Query (CQRS): `GetCustomerByIdQuery.cs`
- DTO: `CustomerDto.cs` (record/class)
- Controller: `CustomerController.cs` (`[ApiController]`)

### Structural Conventions (C#)

- Prefer feature/domain namespaces: `Project.Module.Domain`, `Project.Module.Application`, `Project.Module.Infrastructure`.
- Use `record` for Value Objects (built-in value-based equality).
- Use `init` properties for imutability.
- Use `Task<Result<T>>` for async operations returning results.

### Quick Examples (C#)

- Backend controller: `src/Project.Backend/Controllers/CustomerController.cs`
- Core entity: `src/Project.Core/Domain/Entities/Customer.cs`
- Core VO: `src/Project.Core/Domain/ValueObjects/CustomerName.cs`
- Core use case: `src/Project.Core/Application/UseCases/CreateCustomerUseCase.cs`
- Core repository: `src/Project.Core/Domain/Repositories/ICustomerRepository.cs`

## 9. DDD / Clean Architecture Standards

### Layer Model

All skills follow the same Clean Architecture layer model:

```
Interface (API/UI)   →  backend-controller[-kt|-cs], frontend-form-schema
Application          →  core-use-case[-kt|-cs], core-dto[-kt|-cs], core-query-cqrs[-kt|-cs]
Domain               →  core-entity[-kt|-cs], core-value-object[-kt|-cs], core-domain-service[-kt|-cs], core-repository[-kt|-cs]
Infrastructure       →  backend-prisma-data (TS) / backend-data-kt (KT) / backend-data-cs (CS)
                        config-prisma (TS) / config-jpa-kt (KT) / config-efcore-cs (CS)
```

### Implementation by Stack

| Layer          | Concept             | Skill TS               | Skill KT                 | Skill CS                 |
| -------------- | ------------------- | ---------------------- | ------------------------ | ------------------------ |
| Domain         | Entity              | `core-entity`          | `core-entity-kt`         | `core-entity-cs`         |
| Domain         | Value Object        | `core-value-object`    | `core-value-object-kt`   | `core-value-object-cs`   |
| Domain         | Domain Service      | `core-domain-service`  | `core-domain-service-kt` | `core-domain-service-cs` |
| Domain         | Repository port     | `core-repository`      | `core-repository-kt`     | `core-repository-cs`     |
| Application    | Use Case            | `core-use-case`        | `core-use-case-kt`       | `core-use-case-cs`       |
| Application    | DTO                 | `core-dto`             | `core-dto-kt`            | `core-dto-cs`            |
| Application    | Query CQRS          | `core-query-cqrs`      | `core-query-cqrs-kt`     | `core-query-cqrs-cs`     |
| Infrastructure | Persistence adapter | `backend-prisma-data`  | `backend-data-kt`        | `backend-data-cs`        |
| Infrastructure | Migration           | `config-prisma`        | `config-jpa-kt`          | `config-efcore-cs`       |
| Interface      | Controller          | `backend-controller`   | `backend-controller-kt`  | `backend-controller-cs`  |
| Interface      | Form                | `frontend-form-schema` | —                        | —                        |

> The `req-discovery` skill reads systems in any language/architecture. The agile planning and implementation always use the skills above (TS, KT or CS).

### DDD Concept → Skill Mapping

| DDD Concept          | Skill (agnostic name)                                         |
| -------------------- | ------------------------------------------------------------- |
| Bounded Context      | `config-new-module`                                           |
| Entity               | `core-entity`                                                 |
| Value Object         | `core-value-object`                                           |
| Aggregate            | `core-entity` (root entity)                                   |
| Domain Service       | `core-domain-service`                                         |
| Repository (port)    | `core-repository`                                             |
| Controller           | `backend-controller`                                          |
| Repository (adapter) | `backend-prisma-data` / `backend-data-kt` / `backend-data-cs` |
| Use Case             | `core-use-case`                                               |
| DTO                  | `core-dto`                                                    |
| Query (CQRS)         | `core-query-cqrs`                                             |
| Controller           | `backend-controller`                                          |

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

| Prefix                 | Layer          | Examples                      |
| ---------------------- | -------------- | ----------------------------- |
| `domain:vo`            | Domain         | Value Object creation         |
| `domain:entity`        | Domain         | Entity with business rules    |
| `domain:service`       | Domain         | Policy, calculator, validator |
| `domain:repository`    | Domain         | Repository interface          |
| `app:dto`              | Application    | Input/output contracts        |
| `app:usecase`          | Application    | Use case orchestration        |
| `app:query`            | Application    | CQRS read query               |
| `infra:persistence`    | Infrastructure | DB adapter                    |
| `infra:migration`      | Infrastructure | Schema, migration             |
| `infra:setup`          | Infrastructure | Project bootstrap             |
| `infra:auth`           | Infrastructure | Authentication setup          |
| `infra:db`             | Infrastructure | Database config               |
| `interface:controller` | Interface      | HTTP endpoint                 |
| `interface:form`       | Interface      | Frontend form                 |
| `test:unit`            | Quality        | Unit tests                    |
| `test:e2e`             | Quality        | End-to-end tests              |

## 9. Documentation Output Standards

### Directory Convention

Skills that generate documentation (`req-discovery`, `req-ddd-modeling`, `req-agile-planning`) write to:

```
<projectRoot>/<docsPath>/
├── discovery/
│   └── <system-name>/
│       ├── requirements.md
│       ├── ddd-analysis.md
│       ├── screens.md
│       └── domain-model.md
├── modeling/
│   └── <project-name>/
│       ├── ddd-strategic-model.md
│       ├── ddd-tactical-model.md
│       └── ddd-operational-notes.md
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
Sistema fonte           req-discovery       req-ddd-modeling      req-agile-planning    openspec-propose     openspec-apply-change
(qualquer linguagem) →  (leitura) →         (modelagem DDD) →    (planejamento) →      (proposta change) →  (implementacao TS/KT/CS)
```

- **Entrada**: qualquer sistema (PHP MVC, Go, Python, Java, monolito, etc.)
- **Saida da discovery**: requisitos funcionais/nao-funcionais + analise DDD inicial
- **Saida da modelagem DDD**: modelo estrategico (subdominios, BCs, context map, linguagem ubiqua) + modelo tatico (entities, VOs, events) + notas operacionais
- **Saida do planning**: backlog com tasks referenciando skills TS, KT ou CS
- **Implementacao**: sempre com os skills deste repositorio — TS (sem sufixo), KT (sufixo `-kt`) ou CS (sufixo `-cs`)

---

## 10. Language Stack Comparison

Comparativo detalhado das stacks suportadas para implementação de DDD/Clean Architecture.

| Característica          | TypeScript (Node/Nest)          | Kotlin (JVM/Spring)             | C# (.NET 8+)             |
| :---------------------- | :------------------------------ | :------------------------------ | :----------------------- |
| **Principal Framework** | NestJS                          | Spring Boot                     | ASP.NET Core             |
| **Persistência**        | Prisma / Zod                    | JPA / Hibernate                 | EF Core / Fluent API     |
| **Seeding**             | Modular (Prisma Seed)           | Não padronizado                 | Modular (DataSeeder)     |
| **Erros**               | Result Pattern                  | Exceptions / Result             | Result Pattern           |
| **Tipagem de Dados**    | Interface / Type                | Data Class                      | Record / Class           |
| **Imutabilidade**       | Manual / Readonly               | Nativa (val/data)               | Nativa (init/record)     |
| **Erro Handling**       | Result Pattern (TS-Res)         | kotlin.Result / Arrow           | Result Pattern (Fluent)  |
| **Concorrência**        | Async / Await                   | Coroutines (suspend)            | Async / Await (Task)     |
| **Injeção Depend.**     | Nest DI                         | Spring beans                    | Microsoft.Extensions.DI  |
| **Build Tool**          | npm / yarn / pnpm               | Gradle / Maven                  | dotnet CLI / MSBuild     |
| **Ponto Forte**         | Performance I/O, Ecossistema    | Tipagem forte ríspida, JVM      | Performance, DX, LINQ    |
| **Ponto Fraco**         | Tipos em runtime, Single thread | Curva inicial (Spring), Memória | Ecossistema menos aberto |

### Quando escolher?

- **TypeScript**: Se o time já domina JS/TS, precisa de alta performance em I/O asíncrono ou quer compartilhar tipos com o frontend.
- **Kotlin**: Se precisa da maturidade e ecossistema da JVM, mas quer uma linguagem moderna e concisa com excelente suporte a programação funcional.
- **C#**: Se busca a melhor DX (Developer Experience) do mercado, performance bruta de ponta com o runtime .NET moderno e forte integração com ecossistemas empresariais.
