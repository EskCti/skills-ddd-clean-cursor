---
name: config-project-rs
stack: rust
description: Inicializar workspace Rust (Cargo) com Axum, sqlx, shared-kernel e layout modular por Bounded Context. Usar quando o pedido envolver bootstrap backend Rust, setup Cargo workspace ou estrutura Clean Architecture em Rust.
---

# Config Project (Rust)

## Overview

Bootstrap determinístico e idempotente: workspace Cargo com crate `shared-kernel` e binary `api` (Axum), Postgres via docker-compose dev, layout **modular por camada** sem namespaces redundantes.

## Estrutura alvo

```
project-root/
├── Cargo.toml                 # [workspace]
├── crates/
│   ├── shared-kernel/         # Entity, ValueObject, Result, UseCase
│   └── api/
│       └── src/
│           ├── main.rs
│           ├── lib.rs
│           ├── config.rs
│           └── modules/       # um subdir por Bounded Context
│               ├── health/
│               └── <bc>/      # config-new-module-rs
├── migrations/                # sqlx (config-sqlx-rs)
├── tests/integration/         # test-e2e-rs
├── docker-compose.yml
└── .env.example
```

## Namespaces (obrigatório)

Consultar `../config-shared-core-rs/references/rust-namespace-layout.md`:

- ✅ `modules::customers::domain::Customer`
- ❌ `modules::customers::domain::customer::Customer`
- ❌ `domain::cliente::Cliente`

## Workflow

1. Detectar `Cargo.toml` workspace na raiz; se ausente, copiar template.
2. Validar crates `shared-kernel` e `api`.
3. Configurar `.env`, `docker-compose.yml`, `migrations/`.
4. `cargo build` e `cargo test -p shared-kernel`.
5. Ao **fechar cada épico**: testes + CI + `config-cicd-rs/scripts/check-memory-rs.sh` (ver `skills-standards.md` Epic Definition of Done).

## Commands

```bash
node config-project-rs/scripts/project-init-rs.mjs --project-name=MyApp
cp .env.example .env && docker compose up -d
cargo run -p api
```

## Resources

- `agents/openai.yaml`
- `scripts/project-init-rs.mjs`
- `assets/project-template-rs/`
- `references/bootstrap-contract-rs.md`
- `../config-shared-core-rs/references/rust-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção **Rust Stack Standards**.
