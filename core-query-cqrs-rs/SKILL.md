---
name: core-query-cqrs-rs
stack: rust
description: Criar queries CQRS Rust (leitura) na camada application. Usar quando o pedido envolver busca por id, listagem ou projeção read-only.
---

# Core Query CQRS (Rust)

## Overview

Queries em `application/find_<entity>_by_id.rs` ou `application/list_<bc>.rs` — struct implementando `UseCase<QueryInput, Output>` (não existe trait `Query` dedicado: queries e commands usam o mesmo `shared_kernel::UseCase`).

## Exemplo mínimo (query read-only)

```rust
use shared_kernel::{Result, UseCase};

use crate::modules::customers::application::CustomerOutput;
use crate::modules::customers::domain::ports::CustomerRepository;

pub struct FindCustomerById {
    pub repository: Arc<dyn CustomerRepository>,
}

impl UseCase<Uuid, Option<CustomerOutput>> for FindCustomerById {
    async fn execute(&self, id: Uuid) -> Result<Option<CustomerOutput>> {
        match self.repository.find_by_id(id).await? {
            None => Ok(None),
            Some(customer) => Ok(Some(CustomerOutput::from(&customer))),
        }
    }
}
```

## Guidelines

- Read-only; sem mutar aggregate.
- Pode retornar DTO diretamente (`CustomerOutput::from` — ver `core-dto-rs`).
- Mesmas regras de namespace que use cases: `modules::<bc>::application::<Name>`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.