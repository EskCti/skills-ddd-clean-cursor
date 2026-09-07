# E2E / Integração — Rust

Path: `crates/api/tests/integration.rs` (roda com `cargo test -p api --test integration`).

## Setup

1. **Postgres de teste** via docker-compose (mesmo do CI):

```yaml
# docker-compose.test.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      retries: 5
```

2. **dev-deps** em `crates/api/Cargo.toml` (template `config-project-rs` já inclui):

```toml
[dev-dependencies]
reqwest = { version = "0.12", features = ["json"] }
testcontainers = { version = "0.2" }
```

3. **Cliente HTTP padrão**: `tower::ServiceExt::oneshot` (sobe a app Axum no processo, sem rede) + `reqwest` para o fluxo HTTP. `testcontainers` é opcional — docker-compose é o padrão para o Postgres.

## Exemplo — fluxo POST → GET + 400 com lista de erros

```rust
use tower::ServiceExt;
use serde_json::json;
use shared_kernel::Result;

use api::{router, AppState};

#[tokio::test]
async fn create_customer_then_get_and_validation_errors() -> Result<()> {
    let state = AppState {
        repository: repository_de_teste(),
    };
    let port = 4001;
    let server = router(state).oneshot(port);

    let client = reqwest::Client::new();
    let base = format!("http://127.0.0.1:{port}");

    // POST criar
    let create = client
        .post(format!("{base}/customers"))
        .json(&json!({ "name": "Ana", "email": "ana@example.com" }))
        .send()
        .await?;
    assert_eq!(create.status_code(), 201);
    let id = create.json::<serde_json::Value>().await?["id"].clone();

    // GET buscar
    let get = client
        .get(format!("{base}/customers/{id}"))
        .send()
        .await?;
    assert_eq!(get.status_code(), 200);

    // POST inválido → 400 com a lista COMPLETA de erros (§5.1)
    let invalid = client
        .post(format!("{base}/customers"))
        .json(&json!({ "name": "", "email": "sem-arroba" }))
        .send()
        .await?;
    assert_eq!(invalid.status_code(), 400);
    let body = invalid.json::<serde_json::Value>().await?;
    let errors = body.as_object().get("errors").as_array();
    assert!(errors.is_some() && errors.len() >= 2);

    server.shutdown();
    Ok(())
}
```

> `oneshot` derruba o runtime no `shutdown()` — obrigatório para o memory check (LeakSanitizer) não acusar falso positivo (`memory-leak-check-rs.md`).

## Rodando

```bash
docker compose -f docker-compose.test.yml up -d
DATABASE_URL=postgres://test:test@localhost:5432/test_db cargo test -p api --test integration
```

## NO FAZER

- ❌ Testar contra o Postgres de produção ou `.env` local — sempre container de teste.
- ❌ Assert de só `errors[0]` — validar a lista completa quando o domínio devolve várias.
- ❌ Deixar o app/task rodando após o teste (drop explícito / `shutdown`).
- ❌ Misturar clientes HTTP (reqwest em um teste, `oneshot` em outro) — padrão único: `tower::ServiceExt`.