# Leptos UseCase Pattern (Rust puro + async Result)

## CreateCustomer — application/create_customer.rs

```rust
use std::sync::Arc;

use shared_kernel::Result;

use crate::features::customers::domain::entity::Customer;
use crate::features::customers::domain::ports::CustomerRepository;

pub struct CreateCustomerInput {
    pub name: String,
    pub email: String,
    pub cpf: String,
}

pub struct CreateCustomer {
    repository: Arc<dyn CustomerRepository>,
}

impl CreateCustomer {
    pub fn new(repository: Arc<dyn CustomerRepository>) -> Self {
        Self { repository }
    }

    pub async fn execute(&self, input: CreateCustomerInput) -> Result<Customer> {
        let entity = Customer::try_new(
            uuid::Uuid::new_v4().to_string(),
            input.name,
            input.email,
            input.cpf,
        )?;
        // Regra: email único
        if let Ok(Some(_)) = self.repository.find_by_email(entity.email()).await {
            return Result::Err(vec![shared_kernel::DomainError::validation(
                "Email já cadastrado",
            )]);
        }
        self.repository.create(&entity).await
    }
}

pub struct ListCustomers {
    repository: Arc<dyn CustomerRepository>,
}

impl ListCustomers {
    pub fn new(repository: Arc<dyn CustomerRepository>) -> Self {
        Self { repository }
    }

    pub async fn execute(&self) -> Result<Vec<Customer>> {
        self.repository.find_all().await
    }
}
```

## Checklist

- [ ] Use cases são structs Rust simples (sem `leptos::*`)
- [ ] `execute()` é `async` e retorna `Result<T>`
- [ ] Validações de domínio delegadas à entidade (`try_new`)
- [ ] Regras de negócio no use case (email único, etc.)
- [ ] Repository injetado via `Arc<dyn Trait>`
