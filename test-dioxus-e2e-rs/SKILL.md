---
name: test-dioxus-e2e-rs
stack: rust
description: Testes E2E de fluxos críticos do app Dioxus com simulação de interação (login, listagem, CRUD) contra API real/stub. Usar quando o pedido envolver testes E2E mobile, fluxo crítico, ou validação de integração do app.
---

# Test Dioxus — E2E

## Overview

Testes E2E de fluxos críticos do app Dioxus (login, listagem, CRUD) com **simulação de interação**, rodando contra API real (stub) e Postgres de teste.

## Config

- Local: `tests/e2e/` (ou `mobile-dioxus/tests/`).
- Usa `dioxus-testing` para simular interação (clique, input, navegação).
- API: subir `api` (Axum) com Postgres de teste via docker-compose/Testcontainers.
- Verificar contratos: `400` com `{ errors: [...] }` exibidos como lista na UI.

## Fluxos críticos obrigatórios

1. Login (sucesso + falha com lista de erros).
2. Listagem com paginação.
3. CRUD completo (create → read → update → delete).
4. Guard de rota (redireciona sem token).

## Global Standards

- Consultar `../skills-standards.md` §Epic DoD (E2E verde antes de fechar épico).