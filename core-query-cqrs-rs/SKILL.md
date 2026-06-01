---
name: core-query-cqrs-rs
stack: rust
description: Criar queries CQRS Rust (leitura) na camada application. Usar quando o pedido envolver busca por id, listagem ou projeção read-only.
---

# Core Query CQRS (Rust)

## Overview

Queries em `application/find_<entity>_by_id.rs` ou `application/list_<bc>.rs` — struct implementando `UseCase<QueryInput, Output>` ou trait `Query` dedicado.

## Guidelines

- Read-only; sem mutar aggregate.
- Pode retornar DTO diretamente.
- Mesmas regras de namespace que use cases.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
