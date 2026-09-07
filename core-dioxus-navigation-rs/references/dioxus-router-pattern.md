# Dioxus — Padrão de Roteamento

## App root

```rust
use dioxus::prelude::*;
use dioxus_router::prelude::*;
use navigation::Route;
use core_dioxus_state::AuthStore;

fn App() -> Element {
    let auth = use_context_provider(|| AuthStore::default());
    rsx! {
        Router::<Route> {
            config: || RouterConfig::default().history(...),
        }
    }
}
```

## Guards

- **PrivateRoute**: usa `use_context::<AuthStore>()`; se não `is_authenticated()`, redireciona para `Route::Login` via `use_navigate`.

```rust
#[component]
fn PrivateRoute(page: cx) {
    let auth = use_context::<AuthStore>();
    if !auth.is_authenticated() {
        use_navigate()(Route::Login, None);
    }
    rsx! { Outlet::<Route> {} }
}
```

## Deep linking

- `use_route::<Route>()` para responder a deep links (segmentos de URL nativa).