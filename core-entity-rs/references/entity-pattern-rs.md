# Entity — Rust

Path: `modules/<bc>/domain/entity.rs`

Failures: `Result::Err(Vec<DomainError>)`. Combine VOs before building the entity.

```rust
use shared_kernel::{Entity, EntityId, Result, DomainError};
use shared_kernel::result::combine2;

use super::value_objects::{Email, CustomerName};

pub struct Customer {
    id: EntityId,
    name: CustomerName,
    email: Email,
}

impl Customer {
    pub fn try_new(id: EntityId, raw_name: &str, raw_email: &str) -> Result<Self> {
        let name = CustomerName::try_new(raw_name);
        let email = Email::try_new(raw_email);
        let mut errors = Vec::new();
        let valid_name = match &name {
            Ok(v) => Some(v.clone()),
            Err(e) => { errors.extend(e.clone()); None }
        };
        let valid_email = match &email {
            Ok(v) => Some(v.clone()),
            Err(e) => { errors.extend(e.clone()); None }
        };
        if !errors.is_empty() {
            return Result::Err(errors);
        }
        Ok(Self {
            id,
            name: valid_name.unwrap(),
            email: valid_email.unwrap(),
        })
    }
}
```

Import: `crate::modules::customers::domain::Customer`
