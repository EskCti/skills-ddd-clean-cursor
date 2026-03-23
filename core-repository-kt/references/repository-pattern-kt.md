# Repository Pattern (Kotlin)

## Paths

- Contratos de domínio:
  - `packages/auth/src/main/kotlin/com/example/auth/domain/repository/UserRepository.kt`
  - `packages/product/src/main/kotlin/com/example/product/domain/repository/ProductRepository.kt`
- Implementações de infraestrutura:
  - `apps/backend-kt/src/main/kotlin/com/example/auth/infrastructure/persistence/UserJpaRepository.kt`
  - `apps/backend-kt/src/main/kotlin/com/example/product/infrastructure/persistence/ProductJpaRepository.kt`
- Mocks para testes:
  - `packages/product/src/test/kotlin/com/example/product/test/InMemoryProductRepository.kt`

## Contrato esperado

```kotlin
package com.example.product.domain.repository

import com.example.product.domain.entity.Product
import com.example.shared.domain.vo.Id

interface ProductRepository {
    suspend fun save(product: Product): Result<Unit>
    suspend fun findById(id: Id): Result<Product?>
    suspend fun findAll(): Result<List<Product>>
    suspend fun delete(id: Id): Result<Unit>
}
```

## Implementação JPA (exemplo)

```kotlin
package com.example.product.infrastructure.persistence

import com.example.product.domain.entity.Product
import com.example.product.domain.repository.ProductRepository
import com.example.shared.domain.vo.Id
import org.springframework.stereotype.Repository

@Repository
class ProductJpaRepository(
    private val jpa: SpringDataProductRepository
) : ProductRepository {

    override suspend fun save(product: Product): Result<Unit> = runCatching {
        jpa.save(fromDomain(product))
    }

    override suspend fun findById(id: Id): Result<Product?> = runCatching {
        jpa.findById(id.value)?.let { toDomain(it) }
    }

    override suspend fun findAll(): Result<List<Product>> = runCatching {
        jpa.findAll().map { toDomain(it) }
    }

    override suspend fun delete(id: Id): Result<Unit> = runCatching {
        jpa.deleteById(id.value)
    }

    private fun toDomain(entity: ProductJpaEntity): Product =
        Product.create(id = entity.id, name = entity.name)

    private fun fromDomain(product: Product): ProductJpaEntity =
        ProductJpaEntity(id = product.id.value, name = product.name.value)
}
```

## Repository vs Query (CQRS)

- Repository: usado em comando/escrita e leitura de entidade para preservar invariantes.
- Query: usada para leitura/projeção DTO orientada ao consumidor.

## Checklist de implementação

- [ ] Interface no pacote de domínio com `suspend fun` e retorno `Result`.
- [ ] Implementação não vaza tipo de ORM para o domínio.
- [ ] Erro de not found tratado.
- [ ] Operações compostas usam `@Transactional` quando necessário.
- [ ] Mapeamentos `toDomain`/`fromDomain` explícitos.
- [ ] Mocks de teste seguem contrato real.

## Armadilhas comuns

- Retornar DTO em método de repository (quebra fronteira com query).
- Acoplar use case ao JPA em vez da interface.
- Não normalizar dados ao mapear domínio.
- Esquecer `@Transactional` em operações multi-tabela.

---
