# Leptos Entity Pattern (Rust puro + shared_kernel::Result)

## Entidade — features/customers/domain/entity.rs

```rust
use shared_kernel::{DomainError, Result};

#[derive(Clone, Debug, PartialEq)]
pub struct Customer {
    id: String,
    name: String,
    email: String,
    cpf: String,
    is_active: bool,
}

impl Customer {
    pub fn try_new(id: String, name: String, email: String, cpf: String) -> Result<Self> {
        let mut errors = Vec::new();

        let name = name.trim().to_string();
        if name.len() < 2 {
            errors.push(DomainError::validation("Nome deve ter pelo menos 2 caracteres"));
        }

        let email = email.trim().to_lowercase();
        if !email.contains('@') || !email.contains('.') {
            errors.push(DomainError::validation("Email inválido"));
        }

        let cpf: String = cpf.chars().filter(|c| c.is_ascii_digit()).collect();
        if cpf.len() != 11 {
            errors.push(DomainError::validation("CPF deve ter 11 dígitos"));
        }

        if !errors.is_empty() {
            return Result::Err(errors);
        }

        Result::Ok(Self {
            id,
            name,
            email,
            cpf,
            is_active: true,
        })
    }

    pub fn id(&self) -> &str { &self.id }
    pub fn name(&self) -> &str { &self.name }
    pub fn email(&self) -> &str { &self.email }
    pub fn cpf(&self) -> &str { &self.cpf }
    pub fn is_active(&self) -> bool { self.is_active }

    pub fn deactivate(self) -> Self {
        Self { is_active: false, ..self }
    }
}
```

## Ports — domain/ports.rs

```rust
use super::entity::Customer;
use shared_kernel::Result;

#[async_trait::async_trait]
pub trait CustomerRepository: Send + Sync {
    async fn find_all(&self) -> Result<Vec<Customer>>;
    async fn find_by_id(&self, id: &str) -> Result<Customer>;
    async fn find_by_email(&self, email: &str) -> Result<Option<Customer>>;
    async fn create(&self, customer: &Customer) -> Result<Customer>;
}
```

## Checklist

- [ ] Entidade em `domain/entity.rs` — sem `leptos`, `reqwest`, `serde`
- [ ] `try_new()` acumula erros → `Result::Err(Vec<DomainError>)`
- [ ] Getters para campos (sem expor struct mutável)
- [ ] Trait repository em `domain/ports.rs`
