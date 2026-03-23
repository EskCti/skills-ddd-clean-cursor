# Module Template Contract (Kotlin)

## Goal

Gerar um módulo novo de forma determinística em duas áreas do projeto Kotlin multi-module Gradle:

- package: `packages/<module-name>` (sub-projeto Gradle com domínio puro)
- backend: `apps/backend/src/main/kotlin/<base-package>/modules/<module-name>` + migration Flyway

## Required Files

### Package

- `build.gradle.kts` com dependência em `:packages:shared`
- `src/main/kotlin/<pkg>/domain/entity/<Module>.kt` (data class de domínio)
- `src/main/kotlin/<pkg>/domain/repository/<Module>Repository.kt` (interface)
- `src/test/kotlin/<pkg>/domain/entity/<Module>Test.kt`

### Backend

- `<Module>Controller.kt` — `@RestController` com endpoint GET `/<module-name>`
- `<Module>JpaEntity.kt` — `@Entity` JPA com mapeamento tabela `<module_name>s`
- `<Module>JpaRepository.kt` — Spring Data `JpaRepository<*, UUID>`
- `<Module>Config.kt` — `@Configuration` + `@ComponentScan`
- `db/migration/V<N>__create_<module>.sql` — DDL com `CREATE TABLE IF NOT EXISTS`
- Atualização `settings.gradle.kts` — `include("packages:<module-name>")`
- Atualização `apps/backend/build.gradle.kts` — `implementation(project(":packages:<module-name>"))`

## Package Rules

- Nome do sub-projeto Gradle: `packages:<module-name>`.
- Dependência obrigatória em `:packages:shared`.
- Base package derivado de `<group>.<module>` (ex.: `com.example.billing`).
- Grupo por precedência: `--group` > `PROJECT_GROUP` > config file > `com.example`.

## Source Rules

- Entidade de domínio: `data class` com `companion object { fun tryCreate(): Result<T> }`.
- Repository: interface com `suspend fun` para operações CRUD.
- Teste: valida criação da entidade via `tryCreate`.

## Backend Rules

- Controller deve expor endpoint `GET /<module-name>` retornando JSON de exemplo.
- JPA Entity com `@Table(name = "<module_name>s")`, `@Id` UUID.
- Spring Data repository extendendo `JpaRepository`.
- Configuration com `@ComponentScan` do pacote do módulo.
- Migration Flyway com DDL `CREATE TABLE IF NOT EXISTS`.
- Módulo deve ser registrado como dependência no `build.gradle.kts` do backend.

## Exemplo Mínimo — Controller

```kotlin
@RestController
@RequestMapping("/billing")
class BillingController(
    private val repository: BillingJpaRepository
) {
    @GetMapping
    fun getExample(): Map<String, String> = mapOf(
        "module" to "billing",
        "message" to "billing endpoint is working"
    )
}
```

## Notes

- `--group` permite forçar grupo explícito (ex.: `com.acme`).
- `--force` permite sobrescrever diretórios existentes.
- Seguir convenção global em `../../skills-standards.md`.
