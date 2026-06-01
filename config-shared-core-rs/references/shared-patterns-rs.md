# Shared Kernel — padrões Rust

## Result

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Result<T, E = DomainError> {
    Ok(T),
    Err(E),
}

impl<T, E: std::fmt::Display> Result<T, E> {
    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Result<U, E> {
        match self {
            Result::Ok(v) => Result::Ok(f(v)),
            Result::Err(e) => Result::Err(e),
        }
    }
}
```

## Entity

```rust
pub trait Entity {
    type Id: Clone + PartialEq + Eq + std::fmt::Debug;
    fn id(&self) -> &Self::Id;
}
```

## ValueObject

```rust
pub trait ValueObject: Clone + PartialEq + Eq + std::fmt::Debug {}
```

## UseCase

```rust
#[async_trait::async_trait]
pub trait UseCase<I, O> {
    async fn execute(&self, input: I) -> Result<O>;
}
```

Import nos módulos de BC:

```rust
use shared_kernel::{Entity, Result, ValueObject, UseCase};
```

Nunca `shared_kernel::entity::entity::Entity`.
