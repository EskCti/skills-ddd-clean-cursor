# Use Case Pattern (Kotlin)

## Paths

- Contrato base: módulo shared `UseCase.kt`
- Use cases (exemplos):
  - `packages/product/src/main/kotlin/com/example/product/application/usecase/CreateProductUseCase.kt`
  - `packages/auth/src/main/kotlin/com/example/auth/application/usecase/LoginUseCase.kt`
  - `packages/auth/src/main/kotlin/com/example/auth/application/usecase/ChangePasswordUseCase.kt`
- Testes:
  - `packages/product/src/test/kotlin/com/example/product/application/usecase/CreateProductUseCaseTest.kt`

## Contrato base

```kotlin
package com.example.shared.application

import com.example.shared.domain.result.DomainResult

interface UseCase<IN, OUT> {
    suspend fun execute(data: IN): DomainResult<OUT>
}
```

## Estrutura esperada

1. Definir `data class` para input (e output quando necessário).
2. Declarar classe implementando `UseCase<IN, OUT>`.
3. Injetar dependências via construtor (interfaces de repository/query/provider).
4. Implementar `execute` retornando `Result`.
5. Aplicar validações de fluxo com retorno antecipado em falha.
6. Delegar invariantes de domínio para entidade/VO (`tryCreate`, `copy`).

## Exemplo mínimo

```kotlin
package com.example.product.application.usecase

import com.example.product.domain.entity.Product
import com.example.product.domain.repository.ProductRepository
import com.example.shared.application.UseCase
import com.example.shared.domain.result.DomainResult

data class CreateProductIn(val name: String)

class CreateProductUseCase(
    private val repository: ProductRepository
) : UseCase<CreateProductIn, Unit> {

    override suspend fun execute(data: CreateProductIn): DomainResult<Unit> {
        val product = Product.tryCreate(name = data.name)
            .getOrElse { return DomainResult.failure(it) }

        return repository.save(product
    }
}
}
```

## Checklist de implementação

- [ ] `UseCase<IN, OUT>` implementado corretamente.
- [ ] `execute` com `suspend` e retorno `DomainResult` (lista de erros — nunca `kotlin.Result`).
- [ ] Dependências tipadas por interfaces (não acoplar em implementação).
- [ ] Injetadas no construtor.
- [ ] Falhas tratadas explicitamente com `getOrElse { return DomainResult.failure(...) }`.
- [ ] Criação/atualização de entidades via `tryCreate`/`copy`.
- [ ] Sem lógica de persistência direta (delega para repository).

## Estratégia de testes

- Cenário feliz completo.
- Pré-condições inválidas (input vazio, etc.).
- Falhas de dependência (repository retornando `DomainResult.failure`).
- Comportamento condicional.
- Efeito colateral esperado (mock de repository verificando chamada).

## Armadilhas comuns

- Misturar lógica de validação de entidade no use case sem reutilizar `tryCreate`.
- Não mapear falhas de dependências para erro de domínio.
- Atualizar parcialmente sem preservar estado existente.
- Lançar exceção em vez de retornar `DomainResult.failure` dentro do fluxo normal.

---
