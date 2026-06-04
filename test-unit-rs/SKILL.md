---
name: test-unit-rs
stack: rust
description: Testes unitários Rust para domain e application (#[test], mocks). Usar quando o pedido envolver test:unit, coverage ou mod tests nos módulos BC.
---

# Unit Tests (Rust)

## Overview

Testes colocados em `#[cfg(test)] mod tests` no mesmo arquivo ou `crates/api/src/modules/<bc>/...` — meta **≥95%** domain+application.

## Guidelines

- Ao **fechar o épico**: `cargo test --workspace` + coverage; em seguida `bash config-cicd-rs/scripts/check-memory-rs.sh`.

- Mock ports com `mockall` ou struct fake implementando trait Repository.
- Sem Postgres real em unit tests de domínio.
- `cargo test -p api` / `cargo llvm-cov`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
