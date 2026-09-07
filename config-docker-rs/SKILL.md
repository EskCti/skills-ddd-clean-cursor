---
name: config-docker-rs
stack: rust
description: Dockerfile multi-stage para API Rust (Axum) em produção. Usar quando o pedido envolver container, docker-compose.prod ou deploy Rust.
---

# Config Docker (Rust)

## Overview

Multi-stage: `rust:1-bookworm` builder + `debian:bookworm-slim` runtime. Binary `api` compilado com `cargo build --release -p api` e usuário não-root.

## Estrutura

```
project-root/
├── Dockerfile
├── docker-compose.prod.yml
└── .dockerignore
```

## Workflow

1. Copiar templates completos de `references/docker-pattern-rs.md` (Dockerfile, compose, dockerignore).
2. Validar que `Cargo.lock` está versionado e `migrations/` existe (sqlx offline).
3. Builder: cache de deps com `cargo build` separado (`--locked`) antes do código real.
4. Runner: copiar `/target/release/api`, `EXPOSE 4000`, usuário não-root, HEALTHCHECK.
5. **Validar** `docker build -t app-api .` localmente antes de merge.

## References

- `references/docker-pattern-rs.md` — Dockerfile multi-stage completo, compose prod e dockerignore

## Global Standards

- Consultar `../skills-standards.md` seção **Rust Stack Standards**.