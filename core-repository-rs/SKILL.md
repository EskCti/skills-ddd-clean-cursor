---
name: core-repository-rs
stack: rust
description: Criar ports (traits) de repositório em domain/ports Rust. Usar quando o pedido envolver trait Repository, port de persistência ou contrato async de domínio.
---

# Core Repository (Rust)

## Overview

Traits em `domain/ports/repository.rs` — ex.: `CustomerRepository` em `modules::customers::domain::ports::CustomerRepository`.

## Guidelines

- Trait no **domínio**; implementação sqlx fica em `infrastructure::persistence::*Sqlx`.
- Métodos async com `#[async_trait]` retornando `shared_kernel::Result`.
- Nome do trait: `<Entity>Repository` (sem prefixo `I`).

## Workflow

1. Definir operações do aggregate.
2. Criar trait em `domain/ports/`.
3. Re-export em `domain/ports/mod.rs`.
4. Adapter via `backend-data-rs`.

## Global Standards

- Consultar `../config-shared-core-rs/references/rust-namespace-layout.md`.
