---
name: config-cicd-rs
stack: rust
description: Pipeline CI/CD GitHub Actions para Rust (clippy, test, coverage). Usar quando o pedido envolver workflow Rust ou gate de qualidade.
---

# Config CI/CD (Rust)

## Overview

Workflow CI: `cargo fmt --check`, `cargo clippy`, `cargo test --workspace`, coverage com `cargo llvm-cov` ou tarpaulin — meta **≥95%** em domain+application dos módulos BC.

## Workflow

1. `.github/workflows/ci.yml` em push/PR.
2. Serviço Postgres para testes integração.
3. Falhar PR se coverage abaixo do threshold.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
