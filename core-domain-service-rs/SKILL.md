---
name: core-domain-service-rs
stack: rust
description: Criar serviços de domínio Rust (regras puras entre entidades/VOs). Usar quando o pedido envolver domain service, Policy, Calculator ou Specification em modules/<bc>/domain/services/.
---

# Core Domain Service (Rust)

## Overview

Serviços de domínio em `modules::<bc>::domain::services::<name>.rs` — struct ou impl block com lógica pura, sem Axum/sqlx/Tokio I/O.

## Guidelines

- Apenas em `domain/services/` do BC — nunca em `application/` ou `infrastructure/`.
- Sem dependências de framework, HTTP, banco ou async I/O.
- Preferir funções/métodos determinísticos recebendo entidades/VOs e retornando `Result` ou tipos simples.
- Nomear por intenção: `CustomerUniquenessPolicy`, `OrderTotalCalculator`, `CpfSpecification`.
- Exportar via `domain/services/mod.rs` — path lógico `domain::CustomerUniquenessPolicy` ou `domain::services::CustomerUniquenessPolicy` (re-export flat preferido).

## Workflow

1. Confirmar que a regra não cabe em uma única entidade/VO.
2. Implementar em `domain/services/<snake>.rs`.
3. Re-export em `domain/services/mod.rs` e opcionalmente `domain/mod.rs`.
4. Consumir a partir de use cases (`core-use-case-rs`).
5. Testes unitários — `test-unit-rs`.

## References

- `references/domain-service-pattern-rs.md`
- `../config-shared-core-rs/references/rust-namespace-layout.md`

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
