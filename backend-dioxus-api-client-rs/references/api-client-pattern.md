# Dioxus — Contrato do API Client

## Tipos

```rust
pub enum ApiError {
    Network(String),
    Parse,
    External(Vec<String>),   // lista de erros do backend ({ errors: [...] })
    Unauthorized,
}
```

## Regras

- **Nunca** colapsar a lista `{ errors: [...] }` para um único `message` — preservar `External(Vec<String>)`.
- Mapear `401` → `Unauthorized` (para o store de auth invalidar sessão).
- Retry: `5xx` e timeouts com jitter; `4xx` sem retry.
- Caching: memo para leituras; invalidar em escrita.

## Integração com ports

- Repository port (`domain/ports/repository.rs`) é implementado pelo `ApiClient` (adapter), convertendo `ApiError` → `shared_kernel::Result`.