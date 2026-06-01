---
name: core-use-case-rs
stack: rust
description: Criar use cases Rust implementando shared_kernel::UseCase. Usar quando o pedido envolver command handler, caso de uso ou orquestração application.
---

# Core Use Case (Rust)

## Overview

Use cases em `application/<verb>_<entity_snake>.rs` — struct `CreateCustomer` implementando `UseCase<CreateCustomerInput, CustomerOutput>`.

## Guidelines

- Injetar `Arc<dyn CustomerRepository>` (port, não adapter concreto).
- Orquestrar domínio; retornar `Result`.
- Nome do use case **sem** sufixo `UseCase` redundante se o módulo já é `application` (`CreateCustomer`, não `CreateCustomerUseCase` — opcional, preferir nome curto).

## Workflow

1. Definir input/output DTOs.
2. Implementar struct + `UseCase` async.
3. Wire no handler Axum (`backend-controller-rs`).

## Global Standards

- Consultar `../config-shared-core-rs/references/rust-namespace-layout.md`.
