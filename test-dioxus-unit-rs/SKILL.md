---
name: test-dioxus-unit-rs
stack: rust
description: Testes unitários de domínio, aplicação e componentes Dioxus (dioxus-testing) com cobertura ≥95% em domain+application. Usar quando o pedido envolver testes unitários Rust mobile, testes de componentes Dioxus, ou gate de cobertura do app.
---

# Test Dioxus — Unit

## Overview

Testes unitários do app Dioxus: domínio e aplicação (≥95% lines, conforme `skills-standards.md` §Test Coverage) + testes de componentes com **dioxus-testing**.

## Config

- Domínio/aplicação: `#[cfg(test)] mod tests` no mesmo arquivo (padrão `test-unit-rs`).
- Componentes: `dioxus-testing` + `tokio::test`.
- Mocks de ports com `mockall` ou structs fake — **nunca** device code.
- `cargo llvm-cov` para medir (ver `config-cicd-rs`).

## Exemplo (componente)

```rust
#[cfg(test)]
mod tests {
    use dioxus_testing::*;
    use super::*;

    #[tokio::test]
    async fn renders_customer_name() {
        let mut app = launch(CustomerCard { name: "Ada".into() });
        assert!(app.text_contains("Ada"));
    }
}
```

## Checklist

- VO: válido + cada regra inválida (acumulando múltiplos erros).
- Entity: factory feliz + cada invariante.
- Use case: feliz, precondições, falha de dependência, efeitos colaterais.
- Screen: loading, sucesso, erro com **lista** completa.
- Widget: props default e render.

## Global Standards

- Consultar `../skills-standards.md` §Test Coverage.