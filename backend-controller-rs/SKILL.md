---
name: backend-controller-rs
stack: rust
description: Criar handlers e rotas Axum (HTTP) Rust. Usar quando o pedido envolver REST API, routes ou controllers na camada interfaces/http.
---

# Backend Controller (Rust / Axum)

## Overview

Handlers finos em `interfaces/http/handlers.rs`, rotas em `routes.rs` — delegam a use cases da camada `application`.

## Guidelines

- Mapear `Result` → status HTTP (`AppError` → 404/400/500).
- Extrair `State<AppState>` / extension com use cases.
- Prefixo de rota por BC: `/customers`, `/auth`.
- Sem sqlx nem regras de domínio no handler.

## Workflow

1. Definir rotas em `interfaces/http/routes.rs`.
2. Implementar handlers async.
3. Merge router no `api::router`.
4. E2E com `reqwest` — `test-e2e-rs`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
