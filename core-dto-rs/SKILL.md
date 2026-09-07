---
name: core-dto-rs
stack: rust
description: Criar DTOs de aplicação Rust (Input/Output) com serde. Usar quando o pedido envolver contratos de API na camada application.
---

# Core DTO (Rust)

## Overview

DTOs em `modules::<bc>::application::dto.rs` ou arquivos dedicados — `CreateCustomerInput`, `CustomerOutput`.

## Guidelines

- Ler `references/dto-pattern-rs.md` antes de implementar.
- `Deserialize` para entrada HTTP; `Serialize` para resposta.
- Sem lógica de negócio; validação de formato leve OK, regras de domínio nos VOs.
- Mapper explícito para a entidade (`to_entity`) e para o DTO (`CustomerOutput::from`).
- Nomes com sufixo `Input` / `Output`.

## Workflow

1. Definir campos do contrato HTTP.
2. Criar `dto.rs` com derives serde.
3. Implementar mappers (`to_entity` / `from`).
4. Usar no handler (`backend-controller-rs`) e nas queries (`core-query-cqrs-rs`).

## References

- `references/dto-pattern-rs.md` — exemplo completo com serde + mappers + regras NO FAZER

## Global Standards

- Consultar `../skills-standards.md` seção **Rust**.