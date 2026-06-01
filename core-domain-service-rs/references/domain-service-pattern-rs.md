# Domain Service Pattern (Rust)

## Escopo

- Apenas em `crates/api/src/modules/<bc>/domain/services/`.
- ✅ `modules/customers/domain/services/uniqueness_policy.rs`
- ❌ `application/create_customer.rs` (use case)
- ❌ `infrastructure/persistence/` (adapter)

## Quando criar

- Regra combina múltiplas entidades/VOs.
- Regra não pertence claramente a um único aggregate root.
- Lógica reutilizável por vários use cases.

## Exemplo

```rust
// modules/customers/domain/services/cpf_uniqueness.rs
use shared_kernel::Result;

use crate::modules::customers::domain::{Customer, Cpf};

pub struct CpfUniquenessPolicy;

impl CpfUniquenessPolicy {
    pub fn ensure_unique(cpf: &Cpf, existing: &[Customer]) -> Result<()> {
        if existing.iter().any(|c| c.cpf() == cpf) {
            return Err(/* DomainError */);
        }
        Ok(())
    }
}
```

Re-export em `domain/services/mod.rs`:

```rust
mod cpf_uniqueness;
pub use cpf_uniqueness::CpfUniquenessPolicy;
```

## Checklist

- [ ] Arquivo em `domain/services/`.
- [ ] Sem `sqlx`, `axum`, `reqwest`.
- [ ] Sem async I/O.
- [ ] Testes `#[cfg(test)]` com cenários feliz e borda.
