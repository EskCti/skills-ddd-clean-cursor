---
name: test-e2e-rs
stack: rust
description: Testes E2E HTTP Rust (integração) com api rodando e reqwest/tower. Usar quando o pedido envolver test:e2e ou fluxo POST/GET completo.
---

# E2E Tests (Rust)

## Overview

Testes em `tests/integration/` ou crate `tests/` — sobem app Axum (ou usam `tower::ServiceExt`) + Postgres de teste.

## Guidelines

- Fluxo: POST criar → GET buscar.
- `docker compose` ou `testcontainers` para Postgres.
- `cargo test --test integration`.
- Parte do **fechamento de épico**: após E2E verde, rodar `check-memory-rs.sh` (LeakSanitizer nos mesmos testes de integração).

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
