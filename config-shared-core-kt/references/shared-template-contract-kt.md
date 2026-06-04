# Shared Template Contract (Kotlin)

## Goal

Inicializar `packages/shared` em Kotlin com o baseline completo do kernel de domínio:

- config do módulo (`build.gradle.kts`)
- classe base de domínio (`domain/base/Entity.kt`)
- VOs obrigatórios (`domain/vo/Id.kt`, `domain/vo/Name.kt`, `domain/vo/Email.kt`, `domain/vo/HashPassword.kt`)
- interface de aplicação (`application/UseCase.kt`, `application/dto/PagedResult.kt`)
- contrato de transação (`infrastructure/TransactionManager.kt`)
- testes unitários correspondentes

## Entity.kt — exemplo

```kotlin
package com.example.shared.domain.base

import com.example.shared.domain.vo.Id
import java.time.Instant

abstract class Entity<T : Entity<T>>(
    val id: Id,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Entity<*>) return false
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}
```

## DomainResult.kt — contrato

```kotlin
package com.example.shared.domain.result

data class DomainResult<out T>(val value: T?, val errors: List<String>) {
    val isSuccess: Boolean get() = errors.isEmpty()
    val isFailure: Boolean get() = errors.isNotEmpty()
    // companion: success, failure(List), combine
}
```

## Id.kt — exemplo

```kotlin
package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult
import java.util.UUID

@JvmInline
value class Id private constructor(val value: String) {
    companion object {
        private const val INVALID_ID = "Id must be a valid UUID"

        fun create(value: String? = null): Id =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String? = null): DomainResult<Id> {
            val resolved = value?.trim()?.ifBlank { null } ?: UUID.randomUUID().toString()
            return try {
                UUID.fromString(resolved)
                DomainResult.success(Id(resolved))
            } catch (e: IllegalArgumentException) {
                DomainResult.failure(INVALID_ID)
            }
        }

        fun required(value: String): DomainResult<Id> {
            if (value.isBlank()) {
                return DomainResult.failure(INVALID_ID)
            }
            return tryCreate(value)
        }
    }
}
```

## Name.kt — exemplo

```kotlin
package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class Name private constructor(val value: String) {
    companion object {
        fun create(value: String): Name =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<Name> {
            val errors = mutableListOf<String>()
            val normalized = value.trim()
            if (normalized.isBlank()) errors.add("Name must not be blank")
            if (normalized.length > 255) errors.add("Name must have at most 255 characters")
            if (errors.isNotEmpty()) return DomainResult.failure(errors)
            return DomainResult.success(Name(normalized))
        }
    }
}
```

## Email.kt — exemplo

```kotlin
package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class Email private constructor(val value: String) {
    companion object {
        private const val INVALID_EMAIL = "Invalid email format"
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

        fun create(value: String): Email =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<Email> {
            val normalized = value.trim().lowercase()
            if (!EMAIL_REGEX.matches(normalized)) {
                return DomainResult.failure(INVALID_EMAIL)
            }
            return DomainResult.success(Email(normalized))
        }
    }

    val local: String get() = value.substringBefore('@')
    val domain: String get() = value.substringAfter('@')
}
```

## HashPassword.kt — exemplo

```kotlin
package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class HashPassword private constructor(val value: String) {
    companion object {
        private const val INVALID_HASH = "Invalid bcrypt hash format"
        private val BCRYPT_REGEX = Regex("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$")

        fun create(value: String): HashPassword =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<HashPassword> {
            val trimmed = value.trim()
            if (!BCRYPT_REGEX.matches(trimmed)) {
                return DomainResult.failure(INVALID_HASH)
            }
            return DomainResult.success(HashPassword(trimmed))
        }
    }
}
```

## UseCase.kt

```kotlin
package com.example.shared.application

import com.example.shared.domain.result.DomainResult

interface UseCase<IN, OUT> {
    suspend fun execute(data: IN): DomainResult<OUT>
}
```

## PagedResult.kt

```kotlin
package com.example.shared.application.dto

data class PaginatedInput(
    val page: Int = 1,
    val pageSize: Int = 20
)

data class PaginationMeta(
    val page: Int,
    val pageSize: Int,
    val total: Long,
    val totalPages: Int
)

data class PagedResult<T>(
    val data: List<T>,
    val meta: PaginationMeta
) {
    companion object {
        fun <T> of(items: List<T>, total: Long, page: Int, pageSize: Int): PagedResult<T>
    }
}
```

## TransactionManager.kt

```kotlin
package com.example.shared.infrastructure

interface TransactionManager {
    suspend fun <T> runInTransaction(block: suspend () -> T): T
}
```

## Testes esperados

- `IdTest.kt` — criação com/sem valor, UUID gerado automaticamente, formato inválido.
- `NameTest.kt` — trim, blank, tamanho máximo.
- `EmailTest.kt` — normalização lowercase, regex válido/inválido, getters local/domain.
- `HashPasswordTest.kt` — formato bcrypt válido, strings inválidas.
- `EntityTest.kt` — igualdade por id, hashCode.

## Regras

- Módulo shared sem Spring, sem JPA, sem framework.
- Dependência mínima: `kotlin-stdlib` + `junit`.
- Todas as classes com `companion object` e `tryCreate` retornando **`DomainResult`** (lista de erros em falha).
- VOs simples como `@JvmInline value class`.
