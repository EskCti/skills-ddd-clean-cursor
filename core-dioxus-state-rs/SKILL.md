---
name: core-dioxus-state-rs
stack: rust
description: Gerenciar estado global em Dioxus com use_signal + use_context (stores de autenticação, sessão, tema) e persistência local. Usar quando pedir store, estado global, auth session, tema, persistência mobile Dioxus.
---

# Core Dioxus — State

## Overview

Gerenciamento de estado global com **`use_signal` + `use_context`** compartilhado entre telas, seguindo um mini-padrão de stores (auth, sessão, tema) com persistência local (`dioxus`/lib extra), isolado da UI.

## Config

- Cada store é um struct com signals; registrado via `use_context_provider` no `app.rs`.
- Consumidores usam `use_context::<Store>()`.
- Persistência: `async-storage`/`dioxus-persistent` para manter token/tema entre sessões.
- Stores expõem `Result` do domínio, nunca exceptions.

## Exemplo

```rust
#[derive(Clone, Default)]
struct AuthStore {
    token: Signal<Option<String>>,
    user: Signal<Option<CurrentUser>>,
}

impl AuthStore {
    fn is_authenticated(&self) -> bool {
        self.token.read().is_some()
    }
}

// app.rs
let auth = AuthStore::default();
use_context_provider(|| auth);
```

## References

- Consultar `references/state-pattern.md` para stores e persistência.

## Global Standards

- Consultar `../skills-standards.md`.