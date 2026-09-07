---
name: backend-controller-rs
stack: rust
description: Criar handlers e rotas Axum (HTTP) Rust. Usar quando o pedido envolver REST API, routes ou controllers na camada interfaces/http.
---

# Backend Controller (Rust / Axum)

## Overview

Handlers finos em `interfaces/http/handlers.rs`, rotas em `routes.rs` — delegam a use cases da camada `application`.

## Guidelines

- Ler `references/handler-pattern-rs.md` antes de implementar.
- Mapear `Result<_, Vec<DomainError>>` → `400 { "errors": [...] }` com a **lista completa** (§5.1), `404` para `None`, `500` para erros internos.
- Extrair `State<AppState>` com use cases injetados (`Arc<dyn ...>`).
- Prefixo de rota por BC: `/customers`, `/auth`.
- Sem sqlx nem regras de domínio no handler.

## Workflow

1. Definir rotas em `interfaces/http/routes.rs`.
2. Implementar handlers async (thin, delegando ao use case).
3. Merge router no `api::router`.
4. E2E com `tower::ServiceExt` — `test-e2e-rs`.

## References

- `references/handler-pattern-rs.md` — exemplo completo: `State<AppState>`, injeção do use case, mapeamento 400/404/500

## Global Standards

- Consultar `../skills-standards.md` seção **Rust** e §5.1 (lista completa de erros).