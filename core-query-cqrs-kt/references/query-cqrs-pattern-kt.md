# Query CQRS Pattern (Kotlin)

## Quando usar Query (CQRS)

- Leitura para retornar dados ao front/API.
- Projeções com paginação, filtros, agregações e joins.
- Formato de saída orientado ao consumidor (DTO).

## Quando usar Repository (comando)

- Fluxos de escrita: create/update/delete.
- Leitura para preservar invariantes antes de comando.

## Contrato esperado

```kotlin
package com.example.product.domain.query

import com.example.product.application.dto.ProductDetailsDTO

interface FindProductByIdQuery {
    suspend fun execute(id: String): Result<ProductDetailsDTO?>
}
```

## Contrato com paginação

```kotlin
package com.example.product.domain.query

import com.example.product.application.dto.ProductListItemDTO
import com.example.shared.application.dto.PagedResult

data class ProductFilters(
    val categoryId: String? = null,
    val search: String? = null,
    val page: Int = 1,
    val pageSize: Int = 20
)

interface FindManyProductsQuery {
    suspend fun execute(filters: ProductFilters): Result<PagedResult<ProductListItemDTO>>
}
```

## Implementação JPA (exemplo)

```kotlin
@Repository
class ProductJpaQueryAdapter(
    private val jpa: SpringDataProductRepository
) : FindProductByIdQuery {

    override suspend fun execute(id: String): Result<ProductDetailsDTO?> = runCatching {
        jpa.findById(id)?.let { entity ->
            ProductDetailsDTO(
                id = entity.id,
                name = entity.name,
                categoryName = entity.category?.name ?: ""
            )
        }
    }
}
```

## Checklist de implementação

- [ ] Caso é leitura (não comando).
- [ ] Interface `*Query` está no pacote de domínio.
- [ ] `execute` retorna `Result<DTO>`.
- [ ] DTO alinhado com necessidade do consumidor.
- [ ] Adapter de infraestrutura não vaza detalhes do banco.

## Armadilhas comuns

- Retornar entidade em query voltada a API.
- Colocar regra de escrita numa query.
- Acoplar DTO de leitura à estrutura de banco.
- Misturar responsabilidades (query fazendo comando).

---
