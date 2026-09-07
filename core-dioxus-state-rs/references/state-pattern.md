# Dioxus — Padrão de Stores e Persistência

## Store (auth/sessão/tema)

```rust
#[derive(Clone)]
struct ThemeStore {
    dark: Signal<bool>,
}
```

## Context provider no root

```rust
// app.rs
let theme = ThemeStore::default();
use_context_provider(|| theme);
```

## Persistência local

- Usar `async-storage` / `dioxus-persistent` para gravar token e tema entre sessões.
- Carregar no startup, salvar em `use_effect`.