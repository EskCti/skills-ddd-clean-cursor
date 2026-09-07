# Shared Kernel — padrões Rust

## Result

Failures use **`Err(Vec<DomainError>)`** — always a list. Success is `Ok(T)` with `errors()` returning an empty slice.

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Result<T> {
    Ok(T),
    Err(Vec<DomainError>),
}

const NO_ERRORS: &[DomainError] = &[];

impl<T> Result<T> {
    pub fn ok(value: T) -> Self { Self::Ok(value) }
    pub fn err(message: impl Into<String>) -> Self {
        Self::Err(vec![DomainError::new(message)])
    }
    pub fn fail(errors: Vec<DomainError>) -> Self { Self::Err(errors) }
    pub fn errors(&self) -> &[DomainError] {
        match self {
            Self::Ok(_) => NO_ERRORS,
            Self::Err(e) => e.as_slice(),
        }
    }
}

pub fn combine2<T1, T2>(r1: Result<T1>, r2: Result<T2>) -> Result<(T1, T2)> {
    let mut errors = Vec::new();
    // ... extend from each Err, return Ok((v1, v2)) when empty
}
```

## Entity combine (example)

```rust
let name = CustomerName::try_new(raw_name)?;
let email = Email::try_new(raw_email)?;
// Prefer:
let combined = combine2(name, email)?;
// Or manual:
let mut errors = Vec::new();
if let Err(e) = name { errors.extend(e); }
if let Err(e) = email { errors.extend(e); }
if !errors.is_empty() { return Result::Err(errors); }
```

## DomainError

```rust
#[derive(Debug, Clone, PartialEq, Eq, Error)]
#[error("{0}")]
pub struct DomainError(pub String);
```

Import: `use shared_kernel::{Entity, Result, ValueObject, UseCase, DomainError};`
