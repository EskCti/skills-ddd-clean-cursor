# VO Pattern (Kotlin)

## Paths

- VOs: `packages/shared/src/main/kotlin/com/example/shared/domain/vo/*.kt`
- Tests: `packages/shared/src/test/kotlin/com/example/shared/domain/vo/*Test.kt`

## Core Principles

- Imutabilidade: `val` apenas, sem setters.
- Invariantes: validar no `tryCreate`; usar **`DomainResult<T>`** com `errors: List<String>` (acumular todas as regras).
- Normalização: aplicar `trim()`, `lowercase()`, formatações antes da construção.
- Erros: mensagens descritivas como constantes.
- API consistente: `create` -> chama `tryCreate` + `getOrThrow()`.

## Skeleton — Value Class (tipo simples)

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

## Skeleton — Data Class (tipo composto)

```kotlin
package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

data class Address private constructor(
    val street: String,
    val city: String,
    val zipCode: String
) {
    companion object {
        fun create(street: String, city: String, zipCode: String): Address =
            tryCreate(street, city, zipCode).getOrThrow()

        fun tryCreate(street: String, city: String, zipCode: String): DomainResult<Address> {
            val errors = mutableListOf<String>()
            val s = street.trim()
            val c = city.trim()
            val z = zipCode.trim()
            if (s.isBlank()) errors.add("Street must not be blank")
            if (c.isBlank()) errors.add("City must not be blank")
            if (z.isBlank()) errors.add("Zip code must not be blank")
            if (errors.isNotEmpty()) {
                return DomainResult.failure(errors)
            }
            return DomainResult.success(Address(s, c, z))
        }
    }
}
```

## Reference VOs

- `Id.kt` — geração UUID default, factory `tryCreate(value: String?)`.
- `Email.kt` — normalização lowercase + regex.
- `Name.kt` — trim + validação de tamanho.
- `StrongPassword.kt` — múltiplas regras (length, uppercase, digit, special).
- `HashPassword.kt` — validação de formato bcrypt.

## Test Pattern

- Validar sucesso e falha (`isSuccess`, `isFailure`, `errors` com todos os itens em falha múltipla).
- Verificar normalização do valor armazenado.
- Testar `create` lançando exceção quando inválido.
- Cobrir getters derivados quando existirem.

---
