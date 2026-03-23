# Skills Standards

## Purpose

Centralize global standards used by all project skills.
Use these rules as default when creating or updating files via automation scripts.

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
