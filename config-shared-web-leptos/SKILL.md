---
name: config-shared-web-leptos
stack: rust
description: Bootstrap do shell web admin Leptos SSR com Tailwind CSS v4 — sidebar colapsável, topbar, rodapé, dashboard vazio e rotas de referência. Usar após config-project-leptos quando o pedido envolver layout profissional, menu lateral ou shell reutilizável no frontend Leptos.
---

# Config Shared Web (Leptos)

## Overview

Executa bootstrap idempotente do **shell administrativo** no crate Leptos (`crates/web-leptos` por padrão):

- Tailwind CSS v4 + tokens de tema
- **AdminShell**: sidebar esquerda colapsável, topbar, área principal, **rodapé**
- **SidebarMenu** parametrizável
- Dashboard vazio + página Examples
- Rotas integradas em `app.rs`

> Consultar `../skills-standards.md` §4.1 (Tailwind como padrão).

## Workflow

1. Garantir que `config-project-leptos` já rodou (`crates/web-leptos/Cargo.toml` existe).
2. Executar:

```bash
node config-shared-web-leptos/scripts/init-shared-web-leptos.mjs \
  --frontend-path crates/web-leptos \
  --theme fuchsia \
  --mode dark
```

3. Integrar rotas — o script atualiza `app.rs` para usar `AdminShell` como layout.
4. Validar: `cargo leptos watch` e navegar para `/` e `/examples`.

## Commands

```bash
node config-shared-web-leptos/scripts/init-shared-web-leptos.mjs
node config-shared-web-leptos/scripts/init-shared-web-leptos.mjs --dry-run
```

## O que o script garante

| Artefato | Descrição |
|----------|-----------|
| `style/main.css` | Tailwind v4 + tokens CSS (merge se existir) |
| `layouts/admin_shell.rs` | Shell completo com header + sidebar + footer |
| `components/sidebar_menu.rs` | Menu lateral com seções |
| `components/app_footer.rs` | Rodapé |
| `pages/dashboard.rs` | Dashboard vazio |
| `pages/examples.rs` | Página de referência |
| `shared/shell_navigation.rs` | Itens do menu |

## Integração de rotas

```rust
// app.rs — após bootstrap
use crate::layouts::admin_shell::AdminShell;
use crate::pages::{dashboard::DashboardPage, examples::ExamplesPage};

view! {
    <Router>
        <AdminShell>
            <Routes fallback=|| view! { <p>"Não encontrado"</p> }>
                <Route path=path!("/") view=DashboardPage/>
                <Route path=path!("/examples") view=ExamplesPage/>
            </Routes>
        </AdminShell>
    </Router>
}
```

## References

- `references/integrate-shell.md` — customização do menu e rotas
- `../config-project-leptos/references/tailwind-setup.md`
- `../config-shared-web-vue/SKILL.md` — referência equivalente Vue

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
