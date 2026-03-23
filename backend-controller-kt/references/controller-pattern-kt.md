# Controller Pattern (Kotlin / Spring Boot)

## Paths de referência

- Controllers:
  - `apps/backend-kt/src/main/kotlin/com/example/auth/infrastructure/web/AuthController.kt`
  - `apps/backend-kt/src/main/kotlin/com/example/product/infrastructure/web/ProductController.kt`
- Segurança:
  - Spring Security config: `apps/backend-kt/src/main/kotlin/com/example/config/SecurityConfig.kt`
  - JWT filter: `apps/backend-kt/src/main/kotlin/com/example/config/JwtAuthFilter.kt`

## Papel do controller

- Converter HTTP request em input para use case.
- Controlar autenticação/autorização e status HTTP.
- Traduzir `Result` do core em `ResponseEntity` ou exceção.

## Exemplo mínimo

```kotlin
package com.example.product.infrastructure.web

import com.example.product.application.usecase.CreateProductIn
import com.example.product.application.usecase.CreateProductUseCase
import com.example.product.application.usecase.FindProductByIdUseCase
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/products")
class ProductController(
    private val createProduct: CreateProductUseCase,
    private val findProductById: FindProductByIdUseCase
) {
    @PostMapping
    suspend fun create(@RequestBody body: CreateProductIn): ResponseEntity<Any> {
        val result = createProduct.execute(body)
        return result.fold(
            onSuccess = { ResponseEntity.status(HttpStatus.CREATED).build() },
            onFailure = { ResponseEntity.badRequest().body(mapOf("error" to it.message)) }
        )
    }

    @GetMapping("/{id}")
    suspend fun findById(@PathVariable id: String): ResponseEntity<Any> {
        val result = findProductById.execute(id)
        return result.fold(
            onSuccess = { dto ->
                if (dto != null) ResponseEntity.ok(dto)
                else ResponseEntity.notFound().build()
            },
            onFailure = { ResponseEntity.internalServerError().body(mapOf("error" to it.message)) }
        )
    }
}
```

## Checklist de implementação

- [ ] `@RestController` e `@RequestMapping("rota-base")` definidos.
- [ ] Anotações de método HTTP corretas (`@GetMapping`, `@PostMapping`, `@PatchMapping`, `@DeleteMapping`).
- [ ] Segurança aplicada quando endpoint protegido (`@PreAuthorize`).
- [ ] Inputs extraídos por `@RequestBody`, `@PathVariable`, `@RequestParam`.
- [ ] Falhas mapeadas para `ResponseEntity` com status code coerente.
- [ ] Resposta final segue contrato do endpoint.

## Padrões observados

- Controller injeta use cases via construtor (Spring DI).
- `result.fold(onSuccess, onFailure)` é o padrão para mapear Result.
- Listagens paginadas recebem `page/pageSize` como `@RequestParam` com defaults.
- Endpoints protegidos usam `@PreAuthorize("hasRole('ADMIN')")` ou custom.

## Armadilhas comuns

- Colocar regra de domínio no controller.
- Usar `@Autowired` em campo (preferir construtor).
- Não tratar `Result.failure` e deixar exceção vazar.
- Retornar entidade de domínio ao invés de DTO.
- Misturar lógica de serialização com lógica de negócio.

---
