# Dioxus Mobile — Padrão de Bootstrap

## Pré-requisitos

- Runtime do Rust: `rustup` com targets `aarch64-linux-android`, `x86_64-apple-ios` (ou macOS `aarch64-apple-ios`).
- `cargo-mobile` instalado:
  ```bash
  cargo install --locked cargo-mobile
  ```

## Cargo.toml (crate `mobile-dioxus`)

```toml
[package]
name = "mobile-dioxus"
edition = "2021"

[lib]
crate-type = ["lib", "cdylib", "staticlib"]

[features]
default = ["web"]
web = ["dep:dioxus"]
# dioxus possui suporte mobile nativo independente de SSR:
# em Dioxus 0.6+, o target pode ser desktop/native/mobile via dioxus-native;
# aqui mantemos o crate como app sem SSR (mobile e desktop).

[dependencies]
dioxus = "0.6"
dioxus-router = "0.6"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", default-features = false, features = ["json", "rustls-tls"] }
shared-kernel = { path = "../../shared-kernel" }

[dev-dependencies]
tokio = { version = "1", features = ["full"] }

[workspace]
```

> **Workspace**: `mobile-dioxus` entra nos `[workspace].members` do `Cargo.toml` raiz (igual `web-leptos`). Se não fizer SSR, não precisa de `leptos`.

## Entrypoints (`main.rs`)

Abordagem com **dioxus-native / cargo-mobile**:

```rust
// main.rs — o cargo-mobile gera o entrypoint do platform
use dioxus::prelude::*;
use mobile_dioxus::app::App;

fn main() {
    dioxus::launch(App);
}
```

E o `lib.rs` expõe a `App` para os runners de plataforma:

```rust
pub mod app;
pub mod features;
```

## Configuração

- `.env.example`:
  ```
  DUX_API_BASE_URL=http://10.0.2.2:4000   # Android emulator
  ```
- CORS: no crate `api`, liberar origem/origem de dev do app.
- Em produção: injetar `Default` URL via `DEFAULT_BASE_URL` do compile-time.

## Validação

```bash
cargo check -p mobile-dioxus
cargo test -p mobile-dioxus
cargo mobile build --platform android
```