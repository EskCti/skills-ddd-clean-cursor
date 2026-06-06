---
name: config-project-leptos
stack: rust
description: Inicializar ou continuar frontend Leptos SSR (cargo-leptos + leptos_axum) com Tailwind CSS, em workspace Cargo junto ao backend Axum (crates/web-leptos). Usar quando o pedido envolver bootstrap frontend Leptos, setup SSR Rust, ou padronização full-stack Axum + Leptos.
---

# Config Project (Leptos)

## Overview

Bootstrap determinístico do frontend **Leptos SSR** no mesmo workspace Cargo do backend Axum (`config-project-rs`). Layout Clean Architecture por feature: `domain` / `application` / `infrastructure` / `presentation` — camadas de domínio e aplicação **sem** dependências Leptos.

> **Padrão de estilização**: consultar `../skills-standards.md` §4.1 e `references/tailwind-setup.md`.

## Estrutura alvo

```
project-root/
├── Cargo.toml                    # workspace: shared-kernel, api, web-leptos
├── crates/
│   ├── shared-kernel/
│   ├── api/                      # Axum API (:4000)
│   └── web-leptos/               # Leptos SSR (:3000)
│       ├── Cargo.toml
│       ├── Leptos.toml            # cargo-leptos config
│       ├── style/
│       │   └── main.css           # Tailwind v4
│       └── src/
│           ├── lib.rs
│           ├── main.rs            # servidor SSR (leptos_axum)
│           ├── app.rs             # componente raiz + Router
│           ├── features/            # um subdir por BC
│           │   └── <bc>/
│           │       ├── domain/
│           │       ├── application/
│           │       ├── infrastructure/
│           │       └── presentation/
│           ├── layouts/
│           ├── components/
│           └── shared/
├── package.json                  # tailwindcss (raiz ou web-leptos)
└── .env.example                  # LEPTOS_SITE_ADDR, API_BASE_URL
```

## Namespaces (obrigatório)

Consultar `references/leptos-namespace-layout.md`:

- ✅ `features::customers::domain::Customer`
- ✅ `features::customers::presentation::CustomerListPage`
- ❌ `features::customers::domain::customer::Customer`
- ❌ lógica de negócio em componentes Leptos (usar use cases)

## Workflow

1. Garantir que `config-project-rs` já rodou (`Cargo.toml` workspace na raiz).
2. Executar script de bootstrap:

```bash
node config-project-leptos/scripts/project-init-leptos.mjs \
  --frontend-path crates/web-leptos \
  --api-url http://localhost:4000
```

3. Instalar Tailwind CSS v4 — ver `references/tailwind-setup.md`.
4. Adicionar `web-leptos` ao `[workspace].members` se o script não fez merge.
5. Configurar `.env`: `LEPTOS_SITE_ADDR=127.0.0.1:3000`, `API_BASE_URL=http://localhost:4000`.
6. **Recomendado**: executar `config-shared-web-leptos` para shell admin (sidebar, topbar, rodapé).
7. Validar: `cargo leptos watch` (dev) ou `cargo leptos build --release`.

## Integração com API Axum

- Repositórios HTTP em `infrastructure/` usam `reqwest` apontando para `API_BASE_URL`.
- CORS no crate `api`: permitir origem `http://localhost:3000` (Leptos dev).
- Em produção: reverse proxy (nginx/Caddy) roteando `/api` → `api` e `/` → `web-leptos`.

## Commands

```bash
node config-project-leptos/scripts/project-init-leptos.mjs --frontend-path crates/web-leptos
cargo install cargo-leptos
cargo leptos watch                              # dev SSR + hot reload
cargo leptos build --release                    # produção
```

## References

- Consultar `references/leptos-project-pattern.md` para estrutura detalhada.
- Consultar `references/leptos-namespace-layout.md` para layout de camadas.
- Consultar `references/tailwind-setup.md` para Tailwind v4 com cargo-leptos.
- Consultar `../config-project-rs/SKILL.md` para backend Axum.
- Consultar `../skills-standards.md` para convenções globais.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
