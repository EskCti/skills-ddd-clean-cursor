# Value Object — Rust

Path: `crates/api/src/modules/customers/domain/value_objects/email.rs`

```rust
use shared_kernel::{Result, DomainError, ValueObject};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Email(String);

impl ValueObject for Email {}

impl Email {
    pub fn try_new(raw: &str) -> Result<Self> {
        let trimmed = raw.trim().to_lowercase();
        let mut errors = Vec::new();
        if trimmed.is_empty() {
            errors.push(DomainError::new("email must not be blank"));
        }
        if !trimmed.contains('@') {
            errors.push(DomainError::new("invalid email format"));
        }
        if !errors.is_empty() {
            return Result::Err(errors);
        }
        Ok(Self(trimmed))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

`domain/mod.rs` re-exporta: `pub use value_objects::Email;` → path lógico `domain::Email`.
