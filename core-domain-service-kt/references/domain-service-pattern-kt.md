# Domain Service Pattern (Kotlin)

## Escopo (fronteira)

- Considerar **serviço de domínio** apenas em pacotes `domain` ou `core`.
- Exemplo válido: `com.example.auth.domain.service.PermissionPolicy`
- Exemplo inválido: `com.example.auth.infrastructure.service.*`

## Quando criar um Domain Service

- Regra de negócio não pertence claramente a uma única entidade.
- Regra combina múltiplos objetos de domínio e precisa ser reutilizável.
- Regra deve ser pura e previsível, sem dependência de I/O.

## Estrutura esperada

Opção A — `object` (singleton stateless):

```kotlin
package com.example.stock.domain.service

import com.example.stock.domain.entity.Movement
import com.example.stock.domain.entity.Snapshot

object StockCalculator {
    fun calculate(snapshot: Snapshot?, movements: List<Movement>): Long {
        val base = snapshot?.quantity ?: 0L
        return movements.fold(base) { acc, m ->
            when (m.type) {
                Movement.Type.IN -> acc + m.quantity
                Movement.Type.OUT -> acc - m.quantity
            }
        }
    }
}
```

Opção B — classe simples:

```kotlin
package com.example.auth.domain.service

import com.example.auth.domain.vo.Permission

class PermissionPolicy(private val userPermissions: Set<Permission>) {
    fun hasAll(required: Set<Permission>): Boolean =
        userPermissions.containsAll(required)
}
```

## Checklist de implementação

- [ ] Classe/object em pacote de domínio.
- [ ] Sem dependência de framework (Spring, JPA, etc.).
- [ ] Sem I/O (db/http/fs).
- [ ] Assinatura clara e coesa.
- [ ] Regra de domínio isolada e reutilizável.
- [ ] Cobertura de testes com casos normais e bordas.

## Estratégia de testes

- Testar entrada mínima.
- Testar variação de cenários de negócio.
- Testar casos limite e vazios.
- Garantir determinismo (mesma entrada, mesma saída).

## Armadilhas comuns

- Injetar repositórios ou providers de I/O no serviço de domínio.
- Usar `@Service` do Spring na camada de domínio.
- Duplicar regra já existente em entidade/VO.
- Criar serviço quando método de entidade resolveria melhor.

---
