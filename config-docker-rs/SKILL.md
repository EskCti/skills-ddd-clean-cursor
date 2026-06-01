---
name: config-docker-rs
stack: rust
description: Dockerfile multi-stage para API Rust (Axum) em produção. Usar quando o pedido envolver container, docker-compose.prod ou deploy Rust.
---

# Config Docker (Rust)

## Overview

Multi-stage: `rust:1-bookworm` builder + `debian:bookworm-slim` runtime. Binary `api` compilado com `cargo build --release -p api`.

## Estrutura

```
project-root/
├── Dockerfile
├── docker-compose.prod.yml
└── .dockerignore
```

## Workflow

1. Builder: `cargo build --release -p api`.
2. Runner: copiar `/target/release/api`, `EXPOSE 4000`.
3. Validar `docker build -t app-api .`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
