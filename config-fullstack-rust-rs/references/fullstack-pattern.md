# Full-Stack Rust — Padrão de Integração (Axum + Leptos + Dioxus)

## Workspace

```toml
[workspace]
members = ["crates/shared-kernel", "crates/api", "crates/web-leptos", "crates/mobile-dioxus"]
resolver = "2"
```

## Contrato de erros compartilhado

- `shared_kernel::Result<T>` com `Err(Vec<DomainError>)` em backend, web e mobile.
- API responde `400 { "errors": [...] }` — clientes (Leptos/Dioxus) preservam a lista.

## Geração de clientes

1. Fonte de verdade: `crates/api/src/modules/<bc>/interfaces/http/routes.rs`.
2. Para cada rota, gerar:
   - Leptos: `features/<bc>/infrastructure/repository.rs` (reqwest, DTO serde).
   - Dioxus: `features/<bc>/infrastructure/api_client.rs` (reqwest, retry).
3. DTOs reutilizados de `application/dto.rs` (serde `Deserialize`).

## CORS e envs

```bash
# api/.env
CORS_ORIGINS=http://localhost:3000
# web-leptos/.env
API_BASE_URL=http://localhost:4000
# mobile-dioxus/.env
DUX_API_BASE_URL=http://10.0.2.2:4000
```

## Produção

- Reverse proxy: `/api` → api (:4000), `/` → web-leptos (:3000).
- Mobile aponta para URL pública da API.
- Docker: `config-docker-rs` (api) + build estático/SSR do web; `config-dioxus-cicd-rs` para mobile.

## Validação final

```bash
cargo check --workspace
cargo test --workspace
cargo llvm-cov --workspace --fail-under-lines 95
```