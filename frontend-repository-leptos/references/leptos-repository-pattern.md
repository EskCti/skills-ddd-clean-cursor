# Leptos Repository Pattern (reqwest + DTO + Result)

## DTO — infrastructure/dto.rs

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerApiDto {
    pub id: String,
    pub name: String,
    pub email: String,
    pub cpf: String,
    pub is_active: bool,
}

#[derive(Serialize)]
pub struct CreateCustomerRequest {
    pub name: String,
    pub email: String,
    pub cpf: String,
}
```

## HttpRepository — infrastructure/http_repository.rs

```rust
use std::sync::Arc;

use async_trait::async_trait;
use reqwest::Client;
use shared_kernel::{DomainError, Result};

use crate::features::customers::domain::entity::Customer;
use crate::features::customers::domain::ports::CustomerRepository;
use crate::shared::config::api_base_url;

use super::dto::{CreateCustomerRequest, CustomerApiDto};

pub struct CustomerHttpRepository {
    client: Client,
    base_url: String,
}

impl CustomerHttpRepository {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: api_base_url(),
        }
    }

    fn dto_to_entity(dto: CustomerApiDto) -> Result<Customer> {
        Customer::try_new(dto.id, dto.name, dto.email, dto.cpf)
    }
}

#[async_trait]
impl CustomerRepository for CustomerHttpRepository {
    async fn find_all(&self) -> Result<Vec<Customer>> {
        let url = format!("{}/customers", self.base_url);
        let res = self.client.get(&url).send().await.map_err(|e| {
            vec![DomainError::external(e.to_string())]
        })?;
        if !res.status().is_success() {
            return Result::Err(vec![DomainError::external(format!("HTTP {}", res.status()))]);
        }
        let dtos: Vec<CustomerApiDto> = res.json().await.map_err(|e| {
            vec![DomainError::external(e.to_string())]
        })?;
        let mut entities = Vec::new();
        let mut errors = Vec::new();
        for dto in dtos {
            match Self::dto_to_entity(dto) {
                Ok(e) => entities.push(e),
                Err(e) => errors.extend(e),
            }
        }
        if !errors.is_empty() {
            return Result::Err(errors);
        }
        Ok(entities)
    }

    async fn create(&self, customer: &Customer) -> Result<Customer> {
        let url = format!("{}/customers", self.base_url);
        let body = CreateCustomerRequest {
            name: customer.name().to_string(),
            email: customer.email().to_string(),
            cpf: customer.cpf().to_string(),
        };
        let res = self.client.post(&url).json(&body).send().await.map_err(|e| {
            vec![DomainError::external(e.to_string())]
        })?;
        if res.status().as_u16() == 409 {
            return Result::Err(vec![DomainError::validation("Email já cadastrado")]);
        }
        if !res.status().is_success() {
            return Result::Err(vec![DomainError::external(format!("HTTP {}", res.status()))]);
        }
        let dto: CustomerApiDto = res.json().await.map_err(|e| {
            vec![DomainError::external(e.to_string())]
        })?;
        Self::dto_to_entity(dto)
    }

    // find_by_id, find_by_email — mesmo padrão try/catch HTTP → Result::Err
}
```

## Wiring em presentation (Resource + UseCase)

```rust
let repository: Arc<dyn CustomerRepository> = Arc::new(CustomerHttpRepository::new());
let list_customers = ListCustomers::new(repository.clone());

let customers_resource = Resource::new(move || async move {
    list_customers.execute().await
});
```

## Checklist

- [ ] DTO `CustomerApiDto` separado da entidade
- [ ] `CustomerHttpRepository` implements `CustomerRepository`
- [ ] Erros HTTP → `Result::Err(vec![DomainError::...])`
- [ ] Mapeamento DTO → entidade via `Customer::try_new()`
- [ ] Componentes usam UseCase — não `reqwest` direto
