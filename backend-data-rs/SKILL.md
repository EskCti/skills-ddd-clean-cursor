---
name: backend-data-rs
stack: rust
description: Implementar adapters sqlx (persistência) Rust. Usar quando o pedido envolver repositório concreto, CustomerRecord ou mapeamento DB↔domínio.
---

# Backend Data (Rust / sqlx)

## Overview

Adapters em `infrastructure/persistence/<entity>_repository_sqlx.rs` — struct `CustomerRepositorySqlx` implementa `domain::ports::CustomerRepository`.

## Guidelines

- Record de DB: `CustomerRecord` ou row struct — separado de `domain::Customer`.
- Mapeamento explícito `record.to_domain()` / `Customer::to_record()`.
- Converter erros sqlx → `DomainError` / `AppError`.
- Sem Axum neste layer.

## Workflow

1. Migration via `config-sqlx-rs`.
2. Implementar adapter.
3. Registrar no DI / `AppState` se necessário.
4. Testes integração — `test-e2e-rs`.

## Global Standards

- Consultar `../config-shared-core-rs/references/rust-namespace-layout.md`.
