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

#[derive(Debug, Clone, Deserialize)]
pub struct ApiErrorEnvelope {
    pub errors: Vec<String>,
}
```

## HttpRepository — infrastructure/http_repository.rs

```rust
use std::sync::Arc;

use async_trait::async_trait;
use reqwest::{Client, StatusCode};
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

    /// Parseia o envelope de erro §5.1 que o backend devolve em `{ errors: [...] }`.
    /// Preserva a lista completa — nunca colapsa em `errors[0]`. Se o body não for
    /// JSON, cai em `DomainError::external("HTTP <status>")` como fallback.
    async fn parse_api_errors(res: reqwest::Response) -> Vec<DomainError> {
        let status = res.status();
        match res.json::<ApiErrorEnvelope>().await {
            Ok(envelope) if !envelope.errors.is_empty() => envelope
                .errors
                .into_iter()
                .map(DomainError::external)
                .collect(),
            _ => vec![DomainError::external(format!("HTTP {}", status))],
        }
    }
}

#[async_trait]
impl CustomerRepository for CustomerHttpRepository {
    async fn find_all(&self) -> Result<Vec<Customer>> {
        let url = format!("{}/customers", self.base_url);
        let res = match self.client.get(&url).send().await {
            Ok(res) => res,
            Err(e) => return Result::Err(vec![DomainError::external(e.to_string())]),
        };
        if !res.status().is_success() {
            return Result::Err(Self::parse_api_errors(res).await);
        }
        let dtos: Vec<CustomerApiDto> = match res.json().await {
            Ok(dtos) => dtos,
            Err(e) => return Result::Err(vec![DomainError::external(e.to_string())]),
        };
        let mut entities = Vec::new();
        let mut errors = Vec::new();
        for dto in dtos {
            match Self::dto_to_entity(dto) {
                Result::Ok(e) => entities.push(e),
                Result::Err(e) => errors.extend(e),
            }
        }
        if !errors.is_empty() {
            return Result::Err(errors);
        }
        Result::Ok(entities)
    }

    async fn create(&self, customer: &Customer) -> Result<Customer> {
        let url = format!("{}/customers", self.base_url);
        let body = CreateCustomerRequest {
            name: customer.name().to_string(),
            email: customer.email().to_string(),
            cpf: customer.cpf().to_string(),
        };
        let res = match self.client.post(&url).json(&body).send().await {
            Ok(res) => res,
            Err(e) => return Result::Err(vec![DomainError::external(e.to_string())]),
        };
        if res.status() == StatusCode::CONFLICT {
            return Result::Err(vec![DomainError::validation("Email já cadastrado")]);
        }
        if !res.status().is_success() {
            return Result::Err(Self::parse_api_errors(res).await);
        }
        let dto: CustomerApiDto = match res.json().await {
            Ok(dto) => dto,
            Err(e) => return Result::Err(vec![DomainError::external(e.to_string())]),
        };
        Self::dto_to_entity(dto)
    }

    // find_by_id, find_by_email — mesmo padrão: send().await → match; !is_success() → parse_api_errors(res)
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
- [ ] Erros HTTP → parse do body `{ errors: [...] }` → `Result::Err(Vec<DomainError>)` (§5.1)
- [ ] Mapeamento DTO → entidade via `Customer::try_new()`
- [ ] Componentes usam UseCase — não `reqwest` direto
