# Entity Pattern (Kotlin)

## Paths

- Base entity: módulo shared ou pacote `domain.base`
- Entidades (exemplos):
  - `packages/auth/src/main/kotlin/com/example/auth/domain/entity/User.kt`
  - `packages/product/src/main/kotlin/com/example/product/domain/entity/Product.kt`
  - `packages/branch/src/main/kotlin/com/example/branch/domain/entity/Branch.kt`
- Testes de referência:
  - `packages/auth/src/test/kotlin/com/example/auth/domain/entity/UserTest.kt`
  - `packages/product/src/test/kotlin/com/example/product/domain/entity/ProductTest.kt`

## Estrutura esperada

1. Definir `data class` com construtor `private`.
2. Companion object com `create(props)` e `tryCreate(props): Result<Entity>`.
3. Validar invariantes combinando resultados de VOs.
4. Sobrescrever `equals`/`hashCode` por `id` (não usar o gerado pelo data class).
5. Métodos de domínio retornam nova instância via `copy()` ou `Result`.

## Exemplo mínimo

```kotlin
package com.example.product.domain.entity

import com.example.shared.domain.vo.Id
import com.example.shared.domain.vo.Name

data class Product private constructor(
    val id: Id,
    val name: Name,
    val active: Boolean = true
) {
    companion object {
        fun create(id: String? = null, name: String): Product {
            return tryCreate(id, name).getOrThrow()
        }

        fun tryCreate(id: String? = null, name: String): Result<Product> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validName = Name.tryCreate(name).getOrElse { return Result.failure(it) }
            return Result.success(Product(id = validId, name = validName))
        }
    }

    fun deactivate(): Product = copy(active = false)

    fun changeName(newName: String): Result<Product> {
        val validName = Name.tryCreate(newName).getOrElse { return Result.failure(it) }
        return Result.success(copy(name = validName))
    }

    override fun equals(other: Any?): Boolean =
        other is Product && other.id == this.id

    override fun hashCode(): Int = id.hashCode()
}
```

## Checklist de implementação

- [ ] `data class` com construtor `private`.
- [ ] `companion object` com `create` e `tryCreate`.
- [ ] VOs validados antes de construir a instância.
- [ ] `equals`/`hashCode` sobrescritos por `id`.
- [ ] Métodos de domínio retornam `Product` (copy) ou `Result<Product>`.
- [ ] Sem dependência de framework (Spring, JPA, etc.) na entidade.
- [ ] Testes cobrindo criação válida, inválida e métodos de domínio.

## Estratégia de testes

- Criação válida (`tryCreate` retorna `Result.success`).
- Criação inválida (`tryCreate` retorna `Result.failure` com mensagem).
- Igualdade por `id` (`equals`/`hashCode`).
- `copy` via métodos de domínio com validação.
- Cenários de normalização (quando VOs normalizam entrada).

## Armadilhas comuns

- Usar o `equals`/`hashCode` gerado pelo `data class` (compara todos os campos, não só `id`).
- Deixar construtor público (permite criar instância sem validação).
- Não validar VOs no `tryCreate` (pular validação).
- Misturar anotações JPA na entidade de domínio.
- Usar `var` em vez de `val` (mutabilidade).

---
