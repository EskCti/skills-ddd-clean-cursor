# Skills Standards

## Purpose

Centralize global standards used by all project skills.
Use these rules as default when creating or updating files via automation scripts.

This document covers:

- Naming and structural conventions (TypeScript + Kotlin + C#)
- **Frontend styling standard (Tailwind CSS)**
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

### 4.1 Frontend Styling Standard (Tailwind CSS)

**Tailwind CSS é o padrão obrigatório** para estilização em todos os frontends web deste repositório.

| Framework | Bootstrap | Shell admin | UI / componentes |
|-----------|-----------|-------------|------------------|
| **Next.js** | `config-project` | `config-shared-web` → `AdminShell` + rodapé | Tailwind v4 + Shadcn |
| **Angular** | `config-project-angular` | `config-shared-web-angular` → sidebar + topbar + rodapé | Tailwind v4 + PrimeNG (widgets) |
| **Vue** | `config-project-vue` | `config-shared-web-vue` → sidebar + topbar + rodapé | Tailwind v4 + PrimeVue (widgets) |

Regras:

- **Layout, espaçamento, tipografia, cores, responsividade e shell** → classes utilitárias Tailwind (`flex`, `grid`, `p-*`, `text-*`, `md:`, etc.).
- **Não usar** PrimeFlex, Bootstrap ou CSS global customizado para layout — substituir por Tailwind.
- **PrimeNG / PrimeVue** ficam restritos a widgets complexos (DataTable, DatePicker, Toast) quando necessário; preferir estilizar com classes Tailwind no template.
- **Next.js**: após `config-project`, executar `config-shared-web` (Tailwind + tokens CSS + Shadcn + sidebar/topbar).
- **Tokens de tema**: reutilizar variáveis CSS (`--background`, `--primary`, etc.) alinhadas ao padrão de `config-shared-web/templates/base/src/app/globals.css`.
- **Exceções** devem ser documentadas explicitamente no skill ou ADR do projeto.

Consultar:

- Next.js: `config-shared-web/SKILL.md`
- Angular: `config-shared-web-angular/SKILL.md` + `config-project-angular/references/tailwind-setup.md`
- Vue: `config-shared-web-vue/SKILL.md` + `config-project-vue/references/tailwind-setup.md`

## 5. Skill Authoring Rules

When editing any skill (`*/SKILL.md`):

- Reference this file (`./skills-standards.md`) as global standard source.
- Document explicit exceptions in the skill itself when needed.
- If a skill generates files via script, enforce this standard in generated paths.
- Every `SKILL.md` frontmatter must include `stack:` field (`typescript`, `kotlin`, `csharp`, or `agnostic`).

### Skill Categories

| Category        | Prefix                     | Purpose                                                          | Stack                        |
| --------------- | -------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| Orquestrador    | `config-project-fullstack` | **Ponto de entrada** para projetos completos — define agents em sequência e integra OpenSpec | Agnostic |
| Config          | `config-*`                 | Bootstrap/scaffolding de projeto, módulo ou infra                | TS, KT, CS, RS, Angular, Vue, Flutter, Android |
| Core       | `core-*`     | Padrões de domínio e aplicação (entity, VO, use case)            | TS, KT, CS or RS                 |
| Backend    | `backend-*`  | Camada de infraestrutura/interface do backend                    | TS, KT, CS or RS                 |
| Frontend   | `frontend-*` | Camada de interface web (Tailwind + Next.js/Angular/Vue) | TS, Angular, Vue             |
| Mobile     | `mobile-*`   | Telas e formulários mobile (Flutter, Android Compose)            | Flutter, Android (Kotlin)    |
| Requisitos | `req-*`      | Discovery, modelagem DDD, migração e planejamento                | Agnostic                     |
| Qualidade  | `test-*`     | Testes unitários (≥95% domain/app) e E2E (fluxos críticos)       | TS, KT, CS, RS                   |
| OpenSpec   | `openspec-*` | Fluxo de proposta/exploração/implementação                       | Agnostic                     |
| Workflow   | `git-*`      | Automação de fluxo de trabalho (commits organizados, etc.)       | Agnostic                     |

### Stack Suffix Convention

| Stack             | Suffix      | Framework                         | Automação                                           |
| ----------------- | ----------- | --------------------------------- | --------------------------------------------------- |
| TypeScript        | (none)      | NestJS + Prisma + Next.js/React   | Templates + scripts                                 |
| Kotlin            | `-kt`       | Spring Boot + JPA + Gradle        | Templates + scripts                                 |
| C#                | `-cs`       | ASP.NET Core + EF Core            | Templates + scripts                                 |
| **Rust**          | `-rs`       | Axum + sqlx + Cargo workspace     | Templates + scripts                                 |
| Angular           | `-angular`  | Angular 17+ standalone + Tailwind + PrimeNG (widgets) | Templates                      |
| Vue               | `-vue`      | Vue 3 + Tailwind + PrimeVue + Pinia | Templates                                        |
| Flutter           | `-flutter`  | Flutter + Riverpod + Dio          | Templates                                           |
| Android           | `-android`  | Jetpack Compose + Hilt + Retrofit | Templates                                           |
| Language-agnostic | (none)      | —                                 | `req-discovery`, `req-agile-planning`, `openspec-*` |

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

## 9. Rust Stack Standards

### Naming Pattern

- **Bounded Context folder**: kebab-case — `modules/customers/`
- **Rust module**: snake_case — `mod customers;`
- **Types**: PascalCase — `Customer`, `Email`, `CreateCustomer`
- **Files**: snake_case — `entity.rs`, `repository_sqlx.rs`, `create_customer.rs`
- **Skill directories**: kebab-case com sufixo `-rs`

### Namespace layout (obrigatório)

Consultar `config-shared-core-rs/references/rust-namespace-layout.md`.

| Evitar | Usar |
|--------|------|
| `customers::domain::customer::Customer` | `customers::domain::Customer` |
| `domain::cliente::Cliente` | `customers::domain::Customer` |
| `CustomerEntity` no domínio | `Customer` (domínio) + `CustomerRecord` (infra) |

Camadas por BC: `domain` → `application` → `infrastructure` → `interfaces::http`.

### Recommended paths

| Layer | Path |
|-------|------|
| Entity | `crates/api/src/modules/<bc>/domain/entity.rs` |
| VO | `.../domain/value_objects/email.rs` |
| Port | `.../domain/ports/repository.rs` |
| Use case | `.../application/create_customer.rs` |
| DTO | `.../application/dto.rs` |
| Adapter | `.../infrastructure/persistence/repository_sqlx.rs` |
| HTTP | `.../interfaces/http/handlers.rs` |
| Shared kernel | `crates/shared-kernel/src/` |

### Structural conventions

- Workspace Cargo: `shared-kernel` + `api` binary crate.
- HTTP: Axum; DB: sqlx + Postgres; async: Tokio.
- Ports as `async_trait` traits in `domain::ports`.
- Adapters named `*RepositorySqlx`, `*Sqlx` — never same name as port struct and domain entity.
- `shared_kernel::Result<T>` for domain/application errors.
- Code identifiers in **English**; Portuguese only in UX/docs.

### Quick examples

- Domain entity: `crate::modules::customers::domain::Customer`
- VO: `crate::modules::customers::domain::Email`
- Port: `crate::modules::customers::domain::ports::CustomerRepository`
- Use case: `crate::modules::customers::application::CreateCustomer`
- Adapter: `crate::modules::customers::infrastructure::persistence::CustomerRepositorySqlx`
- Handler: `crate::modules::customers::interfaces::http::create_customer`

## 10. DDD / Clean Architecture Standards

### Layer Model

All skills follow the same Clean Architecture layer model:

```
Interface (API/UI)   →  backend-controller[-kt|-cs|-rs], frontend-form-schema
Application          →  core-use-case[-kt|-cs|-rs], core-dto[-kt|-cs|-rs], core-query-cqrs[-kt|-cs|-rs]
Domain               →  core-entity[-kt|-cs|-rs], core-value-object[-kt|-cs|-rs], core-domain-service[-kt|-cs|-rs], core-repository[-kt|-cs|-rs]
Infrastructure       →  backend-prisma-data (TS) / backend-data-kt (KT) / backend-data-cs (CS) / backend-data-rs (RS)
                        config-prisma (TS) / config-jpa-kt (KT) / config-efcore-cs (CS) / config-sqlx-rs (RS)
```

### Implementation by Stack

| Layer          | Concept             | Skill TS               | Skill KT                 | Skill CS                 | Skill RS                 |
| -------------- | ------------------- | ---------------------- | ------------------------ | ------------------------ | ------------------------ |
| Domain         | Entity              | `core-entity`          | `core-entity-kt`         | `core-entity-cs`         | `core-entity-rs`         |
| Domain         | Value Object        | `core-value-object`    | `core-value-object-kt`   | `core-value-object-cs`   | `core-value-object-rs`   |
| Domain         | Domain Service      | `core-domain-service`  | `core-domain-service-kt` | `core-domain-service-cs` | `core-domain-service-rs` |
| Domain         | Repository port     | `core-repository`      | `core-repository-kt`     | `core-repository-cs`     | `core-repository-rs`     |
| Application    | Use Case            | `core-use-case`        | `core-use-case-kt`       | `core-use-case-cs`       | `core-use-case-rs`       |
| Application    | DTO                 | `core-dto`             | `core-dto-kt`            | `core-dto-cs`            | `core-dto-rs`            |
| Application    | Query CQRS          | `core-query-cqrs`      | `core-query-cqrs-kt`     | `core-query-cqrs-cs`     | `core-query-cqrs-rs`     |
| Infrastructure | Persistence adapter | `backend-prisma-data`  | `backend-data-kt`        | `backend-data-cs`        | `backend-data-rs`        |
| Infrastructure | Migration           | `config-prisma`        | `config-jpa-kt`          | `config-efcore-cs`       | `config-sqlx-rs`         |
| Infrastructure | Docker (produção)   | `config-docker`        | `config-docker-kt`       | `config-docker-cs`       | `config-docker-rs`       |
| Infrastructure | CI/CD               | `config-cicd`          | `config-cicd-kt`         | `config-cicd-cs`         | `config-cicd-rs`         |
| Interface      | Controller          | `backend-controller`   | `backend-controller-kt`  | `backend-controller-cs`  | `backend-controller-rs`  |
| Quality        | Unit tests          | `test-unit`            | `test-unit-kt`           | `test-unit-cs`           | `test-unit-rs`           |
| Quality        | E2E tests           | `test-e2e`             | `test-e2e-kt`            | `test-e2e-cs`            | `test-e2e-rs`            |
| Bootstrap      | Project             | `config-project`       | `config-project-kt`      | `config-project-cs`      | `config-project-rs`      |
| Bootstrap      | Shared kernel       | `config-shared-core`   | `config-shared-core-kt`  | `config-shared-core-cs`  | `config-shared-core-rs`  |
| Bootstrap      | New module          | `config-new-module`    | `config-new-module-kt`   | `config-new-module-cs`   | `config-new-module-rs`   |
| Interface      | Form (Next.js)      | `frontend-form-schema` | —                        | —                        |
| Frontend       | Projeto full-stack  | `config-project` (Next.js) | `config-project-angular` | `config-project-vue`  |
| Frontend       | **Domínio** (Entity + Result) | — | `frontend-entity-angular` | `frontend-entity-vue` |
| Frontend       | **Aplicação** (UseCase)       | — | `frontend-usecase-angular` | `frontend-usecase-vue` |
| Frontend       | **Infra** (Repository + HTTP) | — | `frontend-repository-angular` | `frontend-repository-vue` |
| Frontend       | Página / Listagem   | —                      | `frontend-page-angular`  | `frontend-page-vue`      |
| Frontend       | Formulário          | `frontend-form-schema` | `frontend-form-angular`  | `frontend-form-vue`      |
| Mobile         | Projeto Flutter     | `config-project-flutter` | —                      | —                        |
| Mobile         | Projeto Android     | `config-project-android` | —                      | —                        |
| Mobile         | **Domínio** (Entity + Result) | `mobile-entity-flutter` | `mobile-entity-android` | — |
| Mobile         | **Aplicação** (UseCase)       | `mobile-usecase-flutter` | `mobile-usecase-android` | — |
| Mobile         | **Infra** (Repository + Dio/Retrofit) | `mobile-repository-flutter` | `mobile-repository-android` | — |
| Mobile         | Tela Flutter        | `mobile-screen-flutter`  | —                      | —                        |
| Mobile         | Tela Android        | `mobile-screen-android`  | —                      | —                        |
| Mobile         | Formulário Flutter  | `mobile-form-flutter`    | —                      | —                        |
| Mobile         | Formulário Android  | `mobile-form-android`    | —                      | —                        |

> **Clean Architecture em todos os layers**: frontend e mobile seguem o mesmo modelo do backend — Domain (entity + Result) → Application (use case) → Infrastructure (repository + HTTP) → Presentation (component/screen).
>
> **Padrão Result**: TypeScript usa `Result<T, E>` com `ok()/err()`. Dart/Flutter usa `sealed class Result<T>` (Success/Failure). Android/Kotlin usa `kotlin.Result<T>` com `sealed class Failure`.

> The `req-discovery` skill reads systems in any language/architecture. The agile planning and implementation always use the skills above (TS, KT, CS or RS).

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
| Repository (adapter) | `backend-prisma-data` / `backend-data-kt` / `backend-data-cs` / `backend-data-rs` |
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
11. `interface:form` — Frontend form/page (Next.js, Angular ou Vue)
12. `interface:mobile` — Tela mobile (Flutter ou Android), se aplicável
13. `test:unit` — Unit tests (domain + app)
14. `test:coverage` — Validate ≥95% coverage on domain + application layers
15. `test:e2e` — End-to-end tests

### Test Coverage Standard

| Scope | Target | Enforced in CI |
|-------|--------|----------------|
| **Domain + Application** (por BC/módulo) | **≥95% lines** | Sim — `config-cicd[-kt\|-cs\|-rs]` falha o build se abaixo |
| Infrastructure (adapters, controllers) | ≥80% lines | Recomendado |
| Frontend / Mobile (presentation) | ≥70% lines | Recomendado |
| E2E | Fluxos críticos cobertos | Obrigatório para MVP |

**O que conta para os 95%**: entities, value objects, domain services, use cases, DTOs mappers, queries CQRS.
**O que não conta**: boilerplate de framework, DTOs puros sem lógica, configs, migrations.

**Por stack**:
- **TypeScript**: Jest + `--coverage` + `coverageThreshold` em `jest.config` ou validação no CI
- **Kotlin**: JaCoCo report + gate no Gradle (`min 0.95` para packages `*.domain.*` e `*.application.*`)
- **C#**: Coverlet + `--collect:"XPlat Code Coverage"` + threshold no CI
- **Rust**: `cargo llvm-cov` + gate no CI (`config-cicd-rs`) para packages domain+application

> Este repositório de skills **não executa testes** — os templates gerados (`config-shared-core`, `config-auth-*`) incluem exemplos com `jest --coverage`. A meta de 95% é aplicada nos **projetos gerados** via `config-cicd` e tasks `test:coverage` do backlog.

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
| `interface:form`       | Interface      | Frontend form (web)           |
| `interface:page`       | Interface      | Frontend page/listagem (web)  |
| `interface:mobile`     | Interface      | Tela mobile (Flutter/Android) |
| `test:unit`            | Quality        | Unit tests                    |
| `test:coverage`        | Quality        | Coverage gate (≥95% domain+app) |
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
Sistema fonte           req-discovery       req-ddd-modeling      req-migration-strategy  req-agile-planning    openspec-propose     openspec-apply-change
(qualquer linguagem) →  (leitura) →         (modelagem DDD) →    (estrategia migração) → (planejamento) →      (proposta change) →  (implementacao)
                                                                  [opcional — legado]     EP-000: docker+cicd   bootstrap-<nome>    + test:coverage ≥95%
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
