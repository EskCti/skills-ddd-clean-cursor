# Handler HTTP Axum — Rust

Path: `crates/api/src/modules/customers/interfaces/http/handlers.rs`

## Regra central

Handler **fino**: extrai `State<AppState>`, resolve o use case (com o port `Arc<dyn ...>` já injetado no `AppState`) e mapeia `Result<_, Vec<DomainError>>` → HTTP. **Sem** validar VOs, **sem** sqlx, **sem** regras de negócio.

`AppState` expõe os ports construídos na infraestrutura (ver `backend-data-rs`):

```rust
#[derive(Clone)]
pub struct AppState {
    pub repository: Arc<dyn CustomerRepository>,
}
```

## Create — 201 / 400 com lista completa (§5.1)

```rust
use axum::{Json, State};
use serde_json::json;
use shared_kernel::{DomainError, Result};

use crate::AppState;
use crate::modules::customers::application::{CreateCustomer, CreateCustomerInput};

fn bad_request(errors: &[DomainError]) -> (u16, Json<serde_json::Value>) {
    (400, Json(json!({ "errors": errors.iter().map(|e| e.0).collect() })))
}

pub async fn create_customer(
    state: State<AppState>,
    input: Json<CreateCustomerInput>,
) -> (u16, Json<serde_json::Value>) {
    let use_case = CreateCustomer {
        repository: state.repository,
    };
    match use_case.execute(input.value).await {
        Ok(customer) => (201, Json(json!({ "id": customer.id().as_str() }))),
        Err(errors) => bad_request(errors.as_slice()),
    }
}
```

> `errors` é **sempre a lista completa** de `DomainError` acumulados pelos VOs — nunca `errors[0]` (§5.1 regra 3).

## Find by id — 200 / 404

```rust
pub async fn find_customer_by_id(
    state: State<AppState>,
    id: Path<Uuid>,
) -> (u16, Json<serde_json::Value>) {
    let query = FindCustomerById {
        repository: state.repository,
    };
    match query.execute(id.value).await {
        Ok(Some(customer)) => (200, Json(json!({ "id": customer.id().as_str() }))),
        Ok(None) => (404, Json(json!({ "errors": ["customer not found"] }))),
        Err(errors) => bad_request(errors.as_slice()),
    }
}
```

## 500 — erros internos

Adapters nunca deixam sqlx vazar para o handler: erros de infraestrutura viram `AppError::Internal` (shared-kernel) e são convertidos em `500 { "errors": ["internal error"] }` por um error handler global — sem expor detalhes internos ao cliente.

## NO FAZER

- ❌ Validar VOs ou construir entidades no handler — isso é do use case (`core-use-case-rs`).
- ❌ Chamar `sqlx` / `PgPool` em `interfaces/http` — persistência só em `infrastructure` (`backend-data-rs`).
- ❌ Retornar só `errors[0]` ou `message` única quando o domínio devolveu várias.
- ❌ Retornar `500` com mensagens de infraestrutura (stack trace, SQL) no corpo.
- ❌ Lógica de mapeamento duplicada por handler — reutilizar `bad_request`/helpers.