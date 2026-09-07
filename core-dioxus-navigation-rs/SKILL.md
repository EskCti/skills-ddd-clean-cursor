---
name: core-dioxus-navigation-rs
stack: rust
description: Configurar navegação Dioxus (dioxus-router) com rotas tipadas, guards de auth e deep linking. Usar quando o pedido envolver router, navegação, deep links, guards de rota, ou fluxo mobile Dioxus.
---

# Core Dioxus — Navigation

## Overview

Navegação com **dioxus-router**: rotas tipadas (evitar strings soltas), guards de autenticação/autorização e deep linking.

## Config

- Configurar `dioxus-router` e montar `<Router>` no `app.rs`.
- Definir rotas como tipos (enum `Route`) em `navigation/routes.rs`.
- Guards: componentes `PrivateRoute`/`PublicOnlyRoute`/`AdminRoute` que leem o estado de auth (`core-dioxus-state-rs`) e redirecionam.
- Deep linking via `use_segment`/`use_route`.

## Exemplo

```rust
#[derive(Clone, Routable)]
enum Route {
    #[route("/")]
    Home {},
    #[route("/login")]
    Login {},
    #[route("/customers/:id")]
    CustomerDetail { id: String },
    #[nest("/admin")]
    #[route("/")]
    AdminDashboard {},
}
```

`/customers/:id` —  tipado via `CustomerDetail { id }`.

## Guards

- Deve-se impedir acesso não ambíguo: componentes redirecionam com `use_navigate()(Route::Login)` se `auth_token` ausente.
- Somente o `core-dioxus-state-rs` mantém o token; o guard não lê localStorage diretamente.

## References

- Consultar `references/dioxus-router-pattern.md` para templates.
- Consultar `../core-dioxus-state-rs/SKILL.md` para o store de auth.

## Global Standards

- Consultar `../skills-standards.md`.