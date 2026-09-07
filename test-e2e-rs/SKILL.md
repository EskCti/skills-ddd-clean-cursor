---
name: test-e2e-rs
stack: rust
description: Testes E2E HTTP Rust (integração) com api rodando e tower/reqwest. Usar quando o pedido envolver test:e2e ou fluxo POST/GET completo.
---

# E2E Tests (Rust)

## Overview

Testes em `crates/api/tests/integration.rs` — sobem app Axum no processo com `tower::ServiceExt::oneshot` + Postgres de teste.

## Guidelines

- **Cliente HTTP padrão**: `tower::ServiceExt::oneshot` (subir a app no processo) + `reqwest` para o fluxo HTTP. Não misturar abordagens.
- Fluxo: POST criar → GET buscar → POST inválido com assert de `400 { "errors": [...] }` (lista completa, §5.1).
- Postgres de teste via `docker compose` (padrão) ou `testcontainers` (opcional).
- `reqwest` e `testcontainers` ficam nos **dev-deps** de `crates/api/Cargo.toml` (template `config-project-rs` já inclui).
- `cargo test -p api --test integration`.
- Parte do **fechamento de épico**: após E2E verde, rodar `check-memory-rs.sh` (LeakSanitizer nos mesmos testes de integração).

## References

- `references/e2e-pattern-rs.md` — exemplo completo: oneshot + reqwest, Postgres de teste, fluxo POST→GET e assert de erros

## Global Standards

- Consultar `../skills-standards.md` seção **Rust** e §5.1.