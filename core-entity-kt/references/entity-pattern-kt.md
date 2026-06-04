# Entity Pattern (Kotlin)

## Paths

- Base entity: módulo shared ou pacote `domain.base`
- Entidades: `packages/<bc>/src/main/kotlin/.../domain/entity/`

## Estrutura esperada

1. `data class` com construtor `private`.
2. Companion `create` / `tryCreate` retornando **`DomainResult<Entity>`** (não `kotlin.Result` no domínio).
3. Validar VOs e **combinar** `errors: List<String>` antes de falhar.
4. `equals`/`hashCode` por `id`.

## Exemplo com lista de erros

```kotlin
fun tryCreate(id: String? = null, name: String, email: String): DomainResult<Product> {
    val idResult = Id.tryCreate(id)
    val nameResult = Name.tryCreate(name)
    val emailResult = Email.tryCreate(email)

    val errors = listOf(idResult, nameResult, emailResult).flatMap { it.errors }
    if (errors.isNotEmpty()) return DomainResult.failure(errors)

    return DomainResult.success(
        Product(id = idResult.value!!, name = nameResult.value!!, email = emailResult.value!!)
    )
}
```

Ou: `DomainResult.combine(idResult, nameResult, emailResult)` e depois checar `isFailure`.

## Checklist

- [ ] `DomainResult` com `errors: List<String>` vazia em sucesso.
- [ ] VOs acumulam regras violadas (não só a primeira).
- [ ] Sem Spring/JPA na entidade de domínio.
