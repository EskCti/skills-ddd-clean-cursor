---
name: config-sqlx-rs
stack: rust
description: Configurar sqlx, migrations e pool Postgres em projetos Rust. Usar quando o pedido envolver schema SQL, migrate ou DATABASE_URL no workspace Cargo.
---

# Config SQLx (Rust)

## Overview

Gerenciar pasta `migrations/` na raiz do workspace e integração sqlx no crate `api`.

## Workflow

1. Garantir `DATABASE_URL` em `.env`.
2. `sqlx migrate add <name>` na raiz do projeto.
3. Aplicar: `sqlx migrate run` (com Postgres via docker-compose).
4. Opcional: `sqlx prepare` para offline mode.

## Commands

```bash
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate add create_customers
sqlx migrate run
```

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
