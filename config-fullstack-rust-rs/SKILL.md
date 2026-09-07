---
name: config-fullstack-rust-rs
stack: rust
description: Orquestrar projeto full-stack Rust — Axum (backend) + Leptos (web) + Dioxus (mobile) — com Shared Kernel compartilhado e geração de clientes HTTP a partir das rotas Axum. Usar quando o pedido envolver monorepo Rust completo, integração full-stack, ou combinação Axum + Leptos + Dioxus.
---

# Config Full-Stack (Rust)

## Overview

Orquestra um projeto **full-stack Rust**: backend **Axum** (`config-project-rs`), frontend web **Leptos** (`config-project-leptos`) e app mobile **Dioxus** (`config-mobile-dioxus-rs`), com **Shared Kernel** (`config-shared-core-rs`) compartilhado entre todos e **geração automática de clientes HTTP** a partir das rotas Axum.

## Estrutura do monorepo (Cargo workspace)

```
project-root/
├── Cargo.toml                    # workspace: shared-kernel, api, web-leptos, mobile-dioxus
├── crates/
│   ├── shared-kernel/            # Result, Entity, ValueObject, UseCase — compartilhado
│   ├── api/                      # Axum (:4000) — backend
│   ├── web-leptos/               # Leptos SSR (:3000) — frontend web
│   └── mobile-dioxus/            # Dioxus (iOS + Android) — mobile
├── migrations/                   # sqlx (config-sqlx-rs)
├── docker-compose.yml            # Postgres dev
└── .env.example
```

## Workflow (ordem obrigatória)

1. `config-project-rs` — workspace + `shared-kernel` + `api` Axum.
2. `config-shared-core-rs` — kernel (Result, Entity, VO, UseCase).
3. `config-project-leptos` — frontend web SSR.
4. `config-mobile-dioxus-rs` — app mobile.
5. **Gerar clientes HTTP** a partir das rotas Axum (ver abaixo).
6. `config-docker-rs` + `config-cicd-rs` + `config-dioxus-cicd-rs` — infra e pipelines.
7. `config-fullstack-rust-rs` — validação de integração (CORS, envs, reverse proxy).

## Shared Kernel compartilhado

- `shared_kernel::Result<T>` (`Err(Vec<DomainError>)`) é o contrato de erros em **todos** os crates (backend, web, mobile).
- DTOs de `application/dto.rs` do backend são reutilizados (serde) pelos clientes Leptos/Dioxus.
- Regra: **nunca** duplicar tipos de domínio no frontend/mobile — importar do `shared-kernel`.

## Geração de clientes HTTP a partir das rotas Axum

- Padrão: rotas Axum declaradas em `interfaces/http/routes.rs` são a fonte de verdade.
- Gerar clientes tipados (Leptos: `frontend-repository-leptos`; Dioxus: `backend-dioxus-api-client-rs`) com os mesmos DTOs.
- Manter contrato de erros: clientes parseiam `{ errors: [...] }` e expõem a lista completa.

## Integração

- CORS no `api`: liberar origens de dev (`http://localhost:3000` Leptos, app mobile).
- Envs: `API_BASE_URL` (Leptos), `DUX_API_BASE_URL` (Dioxus).
- Produção: reverse proxy (nginx/Caddy) roteando `/api` → `api`, `/` → `web-leptos`; mobile aponta para URL pública.

## References

- Consultar `references/fullstack-pattern.md` para detalhes de integração.
- Consultar `../config-project-rs/SKILL.md`, `../config-project-leptos/SKILL.md`, `../config-mobile-dioxus-rs/SKILL.md`.
- Consultar `../skills-standards.md` para convenções globais.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.