---
name: config-shared-core-kt
stack: kotlin
description: 'Inicializar o módulo `packages/shared` em Kotlin com baseline completo do domínio compartilhado, incluindo classes base (Entity, ValueObject, Result, UseCase), VOs obrigatórios (Id, Name, Email, HashPassword), interface TransactionManager e testes unitários. Usar quando o pedido envolver bootstrap do pacote shared Kotlin, recriação do shared em novo projeto, ou scaffolding completo do kernel compartilhado de domínio.'
---

# Config Shared Core (Kotlin)

## Overview

Criar ou recriar o módulo shared em Kotlin como biblioteca pura (sem Spring) contendo as abstrações base para DDD/Clean Architecture: Entity, ValueObject, Result helpers, UseCase interface, VOs obrigatórios e TransactionManager.
Equivalente ao `config-shared-core` do stack TypeScript, adaptado para Kotlin.

## Estrutura alvo

```
packages/shared/
├── build.gradle.kts
└── src/
    ├── main/kotlin/com/example/shared/
    │   ├── domain/
    │   │   ├── base/
    │   │   │   ├── Entity.kt
    │   │   │   └── ValueObject.kt
    │   │   └── vo/
    │   │       ├── Id.kt
    │   │       ├── Name.kt
    │   │       ├── Email.kt
    │   │       └── HashPassword.kt
    │   ├── application/
    │   │   ├── UseCase.kt
    │   │   └── dto/
    │   │       └── PagedResult.kt
    │   └── infrastructure/
    │       └── TransactionManager.kt
    └── test/kotlin/com/example/shared/
        ├── domain/
        │   ├── base/
        │   │   └── EntityTest.kt
        │   └── vo/
        │       ├── IdTest.kt
        │       ├── NameTest.kt
        │       ├── EmailTest.kt
        │       └── HashPasswordTest.kt
        └── application/
            └── UseCaseContractTest.kt
```

## Workflow

1. Confirmar que `settings.gradle.kts` inclui `packages:shared`.
2. Criar `packages/shared/build.gradle.kts` como biblioteca Kotlin pura.
3. Criar classes base de domínio (`Entity`, `ValueObject`).
4. Criar VOs obrigatórios: `Id`, `Name`, `Email`, `HashPassword`.
5. Criar interface `UseCase<IN, OUT>` na camada de aplicação.
6. Criar `PagedResult<T>` como DTO genérico de paginação.
7. Criar interface `TransactionManager` na camada de infraestrutura.
8. Criar testes unitários para todas as classes.
9. Validar build: `./gradlew :packages:shared:test`.

## Artefatos obrigatórios

### Classes base

- `Entity.kt` — classe base com `id`, `createdAt`, `updatedAt`, `equals`/`hashCode` por `id`.
- `ValueObject.kt` — classe base (ou marker interface) para VOs.
- `UseCase.kt` — `interface UseCase<IN, OUT> { suspend fun execute(data: IN): Result<OUT> }`.
- `PagedResult.kt` — `data class PagedResult<T>(items: List<T>, total: Long, page: Int, pageSize: Int)`.
- `TransactionManager.kt` — `interface TransactionManager { suspend fun <T> runInTransaction(block: suspend () -> T): T }`.

### VOs obrigatórios

- `Id.kt` — geração UUID, factory `tryCreate(value: String?)`, validação de formato.
- `Name.kt` — trim + validação de tamanho (1-255).
- `Email.kt` — lowercase + regex + getters `local`/`domain`.
- `HashPassword.kt` — validação de formato bcrypt (`$2a$|$2b$|$2y$`).

### Testes obrigatórios

- `IdTest.kt`, `NameTest.kt`, `EmailTest.kt`, `HashPasswordTest.kt` — sucesso, falha, normalização.
- `EntityTest.kt` — igualdade por id, timestamps.

## `build.gradle.kts` do shared

```kotlin
plugins {
    kotlin("jvm")
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
}

tasks.test {
    useJUnitPlatform()
}
```

## Commands

Criar/recriar shared no namespace padrão:

```bash
node config-shared-core-kt/scripts/create-shared-kt.mjs
```

> Se instalado como submódulo: `node .agents/skills/config-shared-core-kt/scripts/create-shared-kt.mjs`

Definir namespace explícito:

```bash
node config-shared-core-kt/scripts/create-shared-kt.mjs --scope @myorg
```

Sobrescrever diretório existente:

```bash
node config-shared-core-kt/scripts/create-shared-kt.mjs --force
```

Criar e executar testes:

```bash
node config-shared-core-kt/scripts/create-shared-kt.mjs --force --run-tests
```

## Resources

- `scripts/create-shared-kt.mjs`: gerador determinístico.
- `assets/shared-template-kt`: template completo do módulo shared (código + testes + config).
- `references/shared-template-contract-kt.md`: contrato dos artefatos gerados.
- Log local de execução: `.log/skills.log`.

## Regras

- **Sem Spring** no módulo shared (domínio puro).
- **Sem JPA** no módulo shared.
- Dependência mínima: apenas `kotlin-stdlib` e `junit` para testes.
- VOs usam `@JvmInline value class` para tipos simples.
- Construtor `private`, factory no `companion object`.

## References

Consultar `references/shared-template-contract-kt.md` para contrato detalhado dos artefatos.
Consultar `../skills-standards.md` para convenção global de nomenclatura (seção Kotlin).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
