---
name: core-dto-rs
stack: rust
description: Criar DTOs de aplicação Rust (Input/Output) com serde. Usar quando o pedido envolver contratos de API na camada application.
---

# Core DTO (Rust)

## Overview

DTOs em `modules::<bc>::application::dto.rs` ou arquivos dedicados — `CreateCustomerInput`, `CustomerOutput`.

## Guidelines

- `Deserialize` para entrada HTTP; `Serialize` para resposta.
- Sem lógica de negócio; validação de formato leve OK, regras de domínio nos VOs.
- Nomes com sufixo `Input` / `Output`.

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
