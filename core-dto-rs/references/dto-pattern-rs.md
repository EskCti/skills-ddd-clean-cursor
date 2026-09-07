# DTO — Rust

Path: `crates/api/src/modules/customers/application/dto.rs`

DTOs são contratos da API na camada `application`: `Deserialize` para entrada HTTP, `Serialize` para resposta. **Sem** lógica de negócio.

## CreateCustomerInput / CustomerOutput

```rust
use serde::{Deserialize, Serialize};
use shared_kernel::{Entity, EntityId, Result};

use crate::modules::customers::domain::Customer;

#[derive(Debug, Deserialize)]
pub struct CreateCustomerInput {
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct CustomerOutput {
    pub id: EntityId,
    pub name: String,
    pub email: String,
}
```

## Mappers para a entidade

```rust
impl CreateCustomerInput {
    pub fn to_entity(&self, id: EntityId) -> Result<Customer> {
        Customer::try_new(id, self.name.as_str(), self.email.as_str())
    }
}

impl CustomerOutput {
    pub fn from(entity: &Customer) -> Self {
        Self {
            id: entity.id().clone(),
            name: entity.name().as_str().into(),
            email: entity.email().as_str().into(),
        }
    }
}
```

> `Customer::try_new` valida e acumula `Vec<DomainError>` nos VOs — o DTO **não** valida regras de negócio, só transporta (`core-entity-rs`, `core-value-object-rs`).

## Uso

- Handler: `Json<CreateCustomerInput>` → `input.value.to_entity(id)` → use case (`backend-controller-rs`).
- Query: `CustomerOutput::from(&customer)` devolve o DTO direto (`core-query-cqrs-rs`).

## NO FAZER

- ❌ Derivar `Entity` / `ValueObject` em DTO — DTO é contrato de transporte, não tipo de domínio.
- ❌ Validar regras de negócio no DTO (ex.: formato de email) — isso é dos VOs; o DTO só faz validação de formato leve (ex.: `String` não vazia via serde).
- ❌ Usar `Customer` (entidade) como corpo de request/response — serializar só DTOs.
- ❌ Nomes sem sufixo `Input` / `Output` — o padrão é obrigatório (§5.1 / `rust-namespace-layout.md`).