# Leptos Project Pattern (SSR + cargo-leptos)

## Cargo.toml (crates/web-leptos)

```toml
[package]
name = "web-leptos"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[[bin]]
name = "web-leptos"
path = "src/main.rs"

[dependencies]
leptos = { version = "0.7", features = ["ssr"] }
leptos_axum = { version = "0.7", features = ["ssr"] }
leptos_meta = { version = "0.7", features = ["ssr"] }
leptos_router = { version = "0.7", features = ["ssr"] }
axum = { workspace = true }
tokio = { workspace = true }
tower = "0.5"
tower-http = { workspace = true }
serde = { workspace = true }
serde_json = { workspace = true }
reqwest = { version = "0.12", features = ["json"] }
tracing = { workspace = true }
shared-kernel = { workspace = true }
cfg-if = "1"

[features]
default = ["ssr"]
ssr = ["leptos/ssr", "leptos_axum/ssr", "leptos_meta/ssr", "leptos_router/ssr"]
hydrate = ["leptos/hydrate", "leptos_meta/hydrate", "leptos_router/hydrate"]
```

## Leptos.toml

```toml
[package]
name = "web-leptos"
site-root = "target/site"
site-pkg-dir = "pkg"
site-addr = "127.0.0.1:3000"
reload-port = 3001

[build]
command = "cargo build --package web-leptos --features ssr"
target-directory = "target"

[serve]
command = "cargo run --package web-leptos --features ssr --no-default-features"
```

## main.rs (servidor SSR)

```rust
use axum::Router;
use leptos::prelude::*;
use leptos_axum::{generate_route_list, LeptosRoutes};
use web_leptos::app::App;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let conf = get_configuration(None).unwrap();
    let leptos_options = conf.leptos_options;
    let addr = leptos_options.site_addr;
    let routes = generate_route_list(App);

    let app = Router::new()
        .leptos_routes(&leptos_options, routes, App)
        .fallback(leptos_axum::file_and_error_handler(App))
        .with_state(leptos_options);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Leptos SSR listening on http://{}", addr);
    axum::serve(listener, app).await.unwrap();
}
```

## app.rs (rotas)

```rust
use leptos::prelude::*;
use leptos_meta::*;
use leptos_router::components::{Route, Router, Routes};

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Html lang="pt-BR" class="dark" />
        <Stylesheet id="leptos" href="/pkg/web-leptos.css"/>
        <Title text="Application"/>
        <Router>
            <main>
                <Routes fallback=|| view! { <p>"Página não encontrada"</p> }>
                    <Route path=path!("/") view=DashboardPage/>
                    <Route path=path!("/customers") view=CustomerListPage/>
                    <Route path=path!("/customers/new") view=CustomerFormPage/>
                </Routes>
            </main>
        </Router>
    }
}
```

## .env.example (adicionar)

```env
LEPTOS_SITE_ADDR=127.0.0.1:3000
LEPTOS_RELOAD_PORT=3001
API_BASE_URL=http://localhost:4000
```

## Checklist

- [ ] Crate `web-leptos` no workspace Cargo
- [ ] `cargo-leptos` instalado (`cargo install cargo-leptos`)
- [ ] Tailwind v4 em `style/main.css` — ver `tailwind-setup.md`
- [ ] `API_BASE_URL` lido em `infrastructure/http_repository.rs`
- [ ] CORS no `api` permite `http://localhost:3000`
- [ ] `cargo leptos watch` sobe sem erros
