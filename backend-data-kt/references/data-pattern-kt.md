# Data Pattern (Kotlin / JPA)

## Paths principais

- Entidades JPA:
  - `apps/backend-kt/src/main/kotlin/com/example/auth/infrastructure/persistence/entity/UserJpaEntity.kt`
  - `apps/backend-kt/src/main/kotlin/com/example/product/infrastructure/persistence/entity/ProductJpaEntity.kt`
- Spring Data repositories:
  - `apps/backend-kt/src/main/kotlin/com/example/auth/infrastructure/persistence/SpringDataUserRepository.kt`
- Adapters (implementam interface de domínio):
  - `apps/backend-kt/src/main/kotlin/com/example/auth/infrastructure/persistence/UserJpaRepository.kt`
- Migrations:
  - `apps/backend-kt/src/main/resources/db/migration/V1__create_users.sql`
- Seeds:
  - `apps/backend-kt/src/main/kotlin/com/example/config/DataSeeder.kt`

## Entidade JPA (exemplo)

```kotlin
package com.example.product.infrastructure.persistence.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "products")
data class ProductJpaEntity(
    @Id
    val id: String,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val price: Double,

    @Column(name = "category_id")
    val categoryId: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at")
    val updatedAt: Instant? = null
)
```

## Spring Data Repository (interface automática)

```kotlin
package com.example.product.infrastructure.persistence

import com.example.product.infrastructure.persistence.entity.ProductJpaEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SpringDataProductRepository : JpaRepository<ProductJpaEntity, String>
```

## Adapter — mapeamento domínio (exemplo)

```kotlin
package com.example.product.infrastructure.persistence

import com.example.product.domain.entity.Product
import com.example.product.domain.repository.ProductRepository
import com.example.shared.domain.result.DomainResult
import com.example.shared.domain.vo.Id
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class ProductJpaRepository(
    private val jpa: SpringDataProductRepository
) : ProductRepository {

    @Transactional
    override suspend fun save(product: Product): DomainResult<Unit> =
        runCatching { jpa.save(fromDomain(product) }
            .fold(
                onSuccess = { DomainResult.success(Unit) },
                onFailure = { DomainResult.failure(listOf(it.message ?: "Unexpected persistence error"))) }
            )

    override suspend fun findById(id: Id): DomainResult<Product?> =
        runCatching { jpa.findById(id.value).orElse(null)?.let { toDomain(it) } }
            .fold(
                onSuccess = { DomainResult.success(it) },
                onFailure = { DomainResult.failure(listOf(it.message ?: "Unexpected persistence error"))) }
            )

    override suspend fun findById(id: Id): Result<Product?> = runCatching {
        jpa.findById(id.value).orElse(null)?.let { toDomain(it) }
    }

    private fun toDomain(entity: ProductJpaEntity): Product =
        Product.create(id = entity.id, name = entity.name)

    private fun fromDomain(product: Product): ProductJpaEntity =
        ProductJpaEntity(
            id = product.id.value,
            name = product.name.value,
            price = 0.0
        )
}
```

## Migration Flyway (exemplo)

```sql
-- V1__create_products.sql
CREATE TABLE products (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    price       DOUBLE PRECISION NOT NULL DEFAULT 0,
    category_id VARCHAR(36),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP
);
```

## Checklist de alterações

### 1. Modelagem JPA

- [ ] `@Entity` e `@Table` definidos com nomes de tabela/coluna corretos.
- [ ] Relações (`@ManyToOne`, `@OneToMany`) e `@JoinColumn` quando necessário.
- [ ] IDs como `String` (UUID) com `@Id`.

### 2. Migration

- [ ] Script SQL versionado no Flyway/Liquibase.
- [ ] Constraints e índices necessários.

### 3. Adapter

- [ ] Implementa interface de domínio.
- [ ] Mapeamento `toDomain`/`fromDomain` explícito.
- [ ] `@Transactional` em operações de escrita compostas.
- [ ] `runCatching` para encapsular erros em `DomainResult` (lista completa — nunca `kotlin.Result`).

### 4. Seed

- [ ] Dados iniciais via `CommandLineRunner` ou `@PostConstruct`.
- [ ] Idempotente (verifica existência antes de inserir).

## Armadilhas comuns

- Usar entidade JPA como entidade de domínio (acopla ORM ao domínio).
- Esquecer `@Transactional` em operações multi-tabela.
- Não regenerar migrations após mudanças de modelo.
- Retornar DTO em método de repository de comando.
- Deixar exceção vazar do `runCatching` — mapear para `DomainResult.failure(listOf(...))`.
- Retornar `Result<Unit>` (kotlin.Result, primeira-falha) — usar `DomainResult` com `errors: List<String>`.
- Usar `var` desnecessariamente nas entidades JPA.

---
