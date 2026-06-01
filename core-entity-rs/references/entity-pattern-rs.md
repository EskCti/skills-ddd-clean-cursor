# Entity — Rust

```rust
// modules/customers/domain/entity.rs
use shared_kernel::{Entity, EntityId, Result, DomainError};

use super::value_objects::{Email, CustomerName};

#[derive(Debug, Clone)]
pub struct Customer {
    id: EntityId,
    name: CustomerName,
    email: Email,
    active: bool,
}

impl Entity for Customer {
    fn id(&self) -> &EntityId {
        &self.id
    }
}

impl Customer {
    pub fn create(id: EntityId, name: CustomerName, email: Email) -> Result<Self> {
        Ok(Self { id, name, email, active: true })
    }

    pub fn deactivate(&mut self) -> Result<()> {
        if !self.active {
            return Result::err(DomainError::new("already inactive"));
        }
        self.active = false;
        Result::ok(())
    }
}
```

Import externo: `use crate::modules::customers::domain::Customer;`
