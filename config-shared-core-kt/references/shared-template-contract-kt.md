# Shared Template Contract (Kotlin)

## Goal

Inicializar `packages/shared` em Kotlin com o baseline completo do kernel de domínio:

- config do módulo (`build.gradle.kts`)
- classes base de domínio (`domain/base/Entity.kt`, `domain/base/ValueObject.kt`)
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

## Id.kt — exemplo

```kotlin
package com.example.shared.domain.vo

import java.util.UUID

@JvmInline
value class Id private constructor(val value: String) {
    companion object {
        private const val INVALID_ID = "Id must be a valid UUID"

        fun create(value: String? = null): Id =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String? = null): Result<Id> {
            val resolved = value?.trim()?.ifBlank { null } ?: UUID.randomUUID().toString()
            return try {
                UUID.fromString(resolved)
                Result.success(Id(resolved))
            } catch (e: IllegalArgumentException) {
                Result.failure(IllegalArgumentException(INVALID_ID))
            }
        }

        fun required(value: String): Result<Id> {
            if (value.isBlank()) {
                return Result.failure(IllegalArgumentException(INVALID_ID))
            }
            return tryCreate(value)
        }
    }
}
```

## Name.kt — exemplo

```kotlin
package com.example.shared.domain.vo

@JvmInline
value class Name private constructor(val value: String) {
    companion object {
        private const val INVALID_NAME = "Name must not be blank and must have at most 255 characters"

        fun create(value: String): Name =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<Name> {
            val normalized = value.trim()
            if (normalized.isBlank() || normalized.length > 255) {
                return Result.failure(IllegalArgumentException(INVALID_NAME))
            }
            return Result.success(Name(normalized))
        }
    }
}
```

## Email.kt — exemplo

```kotlin
package com.example.shared.domain.vo

@JvmInline
value class Email private constructor(val value: String) {
    companion object {
        private const val INVALID_EMAIL = "Invalid email format"
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

        fun create(value: String): Email =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<Email> {
            val normalized = value.trim().lowercase()
            if (!EMAIL_REGEX.matches(normalized)) {
                return Result.failure(IllegalArgumentException(INVALID_EMAIL))
            }
            return Result.success(Email(normalized))
        }
    }

    val local: String get() = value.substringBefore('@')
    val domain: String get() = value.substringAfter('@')
}
```

## HashPassword.kt — exemplo

```kotlin
package com.example.shared.domain.vo

@JvmInline
value class HashPassword private constructor(val value: String) {
    companion object {
        private const val INVALID_HASH = "Invalid bcrypt hash format"
        private val BCRYPT_REGEX = Regex("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$")

        fun create(value: String): HashPassword =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<HashPassword> {
            val trimmed = value.trim()
            if (!BCRYPT_REGEX.matches(trimmed)) {
                return Result.failure(IllegalArgumentException(INVALID_HASH))
            }
            return Result.success(HashPassword(trimmed))
        }
    }
}
```

## UseCase.kt

```kotlin
package com.example.shared.application

interface UseCase<IN, OUT> {
    suspend fun execute(data: IN): Result<OUT>
}
```

## PagedResult.kt

```kotlin
package com.example.shared.application.dto

data class PagedResult<T>(
    val items: List<T>,
    val total: Long,
    val page: Int,
    val pageSize: Int
)
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
- Todas as classes com `companion object` e `tryCreate` retornando `Result`.
- VOs simples como `@JvmInline value class`.
