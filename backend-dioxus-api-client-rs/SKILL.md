---
name: backend-dioxus-api-client-rs
stack: rust
description: Cliente HTTP tipado do app Dioxus consumindo DTOs do shared-kernel com Result<_, ApiError>, retry policy e caching. Usar quando o pedido envolver API client mobile Dioxus, repository HTTP, reqwest tipado, retry, ou integração com o backend.
---

# Backend Dioxus — API Client

## Overview

Cliente HTTP tipado para o app Dioxus consumir a API Axum, mapeando o contrato de erros do backend (`{ errors: [...] }`) para `Result<_, ApiError>`, com retry policies e caching.

## Config

- Local: `features/<bc>/infrastructure/`.
- Usa `reqwest` (json + rustls) ou `dioxus-http`.
- DTOs `serde::Deserialize` reutilizando tipos do `shared-kernel`.
- Mapear qualquer erro HTTP para `ApiError` que **preserva a lista** `errors: Vec<String>` retornada pelo backend (contrato §5.1).

## Exemplo

```rust
#[derive(serde::Deserialize)]
struct ApiErrorBody {
    errors: Vec<String>,
}

async fn parse_customer_dto(resp: reqwest::Response) -> Result<CustomerDto, ApiError> {
    let status = resp.status();
    let text = resp.text().await.map_err(|e| ApiError::Network(e.to_string()))?;
    if status.is_success() {
        serde_json::from_str(&text).map_err(|_| ApiError::Parse)
    } else {
        let body: ApiErrorBody = serde_json::from_str(&text).unwrap_or(ApiErrorBody { errors: vec![format!("HTTP {}", status)] });
        Err(ApiError::External(body.errors))
    }
}
```

## Retry / Caching

- Retry para `5xx`/timeout (retry jitter exponencial), sem retry para `4xx`.
- Caching opcional em memória (memo) para listagens readonly; invalidar em escrita.

## Global Standards

- Consultar `../skills-standards.md`.