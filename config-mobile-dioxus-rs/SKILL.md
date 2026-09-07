---
name: config-mobile-dioxus-rs
stack: rust
description: Inicializar ou continuar app mobile Dioxus (iOS + Android) em workspace Cargo junto ao backend Axum (crates/mobile-dioxus). Usar quando o pedido envolver bootstrap Dioxus mobile, cargo-mobile, setup de plataforma mobile Rust, ou padronização full-stack Axum + Dioxus.
---

# Config Mobile — Dioxus (Rust)

## Overview

Bootstrap determinístico do app **Dioxus Mobile** no mesmo workspace Cargo do backend Axum (`config-project-rs`). Clean Architecture por feature: `core` / `domain` / `application` / `infrastructure` / `presentation` — camadas de domínio e aplicação **sem** dependências Dioxus.

> **Padrão**: reutiliza `shared_kernel` e DTOs do backend (ver `config-fullstack-rust-rs`).

## Estrutura alvo

```
project-root/
├── Cargo.toml                    # workspace: shared-kernel, api, mobile-dioxus
├── crates/
│   ├── shared-kernel/
│   ├── api/                      # Axum API (:4000)
│   └── mobile-dioxus/            # App Dioxus (iOS + Android)
│       ├── Cargo.toml            # features mobile (dioxus-mobile/cargo-mobile)
│       ├── Dioxus.toml
│       ├── src/
│       │   ├── lib.rs
│       │   ├── main.rs           # entrypoint cargo-mobile / platform
│       │   ├── app.rs            # componente raiz + Router + state providers
│       │   ├── features/           # um subdir por BC
│       │   │   └── <bc>/
│       │   │       ├── domain/
│       │   │       ├── application/
│       │   │       ├── infrastructure/
│       │   │       └── presentation/     # screens + widgets
│       │   ├── screens/
│       │   ├── widgets/
│       │   ├── hooks/
│       │   ├── services/         # API client, platform bridges
│       │   ├── navigation/
│       │   └── shared/
│       └── assets/
├── android/                       # projeto Android (cargo-mobile)
├── ios/                           # projeto iOS (cargo-mobile)
├── package.json                  # scripts de apoio (opcional)
└── .env.example                  # DUX_API_BASE_URL
```

## Namespaces (obrigatório)

Consultar `references/dioxus-namespace-layout.md`:

- ✅ `features::customers::domain::Customer`
- ✅ `features::customers::presentation::CustomerListScreen`
- ❌ `features::customers::domain::customer::Customer`
- ❌ lógica de negócio em `#[component]` (usar use cases)

## Workflow

1. Garantir que `config-project-rs` já rodou (`Cargo.toml` workspace na raiz).
2. Executar script de bootstrap:

```bash
node config-mobile-dioxus-rs/scripts/project-init-dioxus.mjs \
  --mobile-path crates/mobile-dioxus \
  --api-url http://localhost:4000
```

3. Instalar `cargo-mobile` para targets nativos:
```bash
cargo install cargo-mobile
cd crates/mobile-dioxus
cargo mobile init   # cria android/ e ios/ (ou reutilizar gerado)
cargo mobile build --platform android
cargo mobile build --platform ios
```

4. Adicionar `mobile-dioxus` ao `[workspace].members`.
5. Configurar `.env`: `DUX_API_BASE_URL` (URL da API; ver `config-fullstack-rust-rs`).
6. **Recomendado**: executar `core-dioxus-state-rs` (stores) e `core-dioxus-navigation-rs` (rotas) para o shell base.
7. Validar: `cargo dioxus run --platform android` (dev) e `cargo build --release`.

## Integração com API Axum

- Repositories HTTP em `infrastructure/` usam `reqwest`/`dioxus-http` apontando para a env `DUX_API_BASE_URL` (com fallback compile-time `DEFAULT_BASE_URL`).
- CORS no crate `api`: liberar a origem/origem de app mobile se necessário.
- Em produção: URL de produção injetada por env/compile-time (`DEFAULT_BASE_URL`).

## Commands

```bash
node config-mobile-dioxus-rs/scripts/project-init-dioxus.mjs --mobile-path crates/mobile-dioxus
cargo install cargo-mobile
cargo mobile init --platform android
cargo run                        # desktop (dev)
cargo mobile build --release --platform ios
```

## References

- Consultar `references/dioxus-namespace-layout.md` para layout de camadas.
- Consultar `references/mobile-bootstrap-pattern.md` para detalhes de bootstrap.
- Consultar `../config-project-rs/SKILL.md` para backend Axum.
- Consultar `../config-fullstack-rust-rs/SKILL.md` para integração full-stack (Axum + Leptos + Dioxus).
- Consultar `../skills-standards.md` para convenções globais.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.