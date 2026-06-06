# Integrar Shell Leptos

## Customizar menu

Editar `src/shared/shell_navigation.rs`:

```rust
pub struct NavItem {
    pub label: &'static str,
    pub href: &'static str,
    pub icon: &'static str,
}

pub fn main_nav_items() -> Vec<NavItem> {
    vec![
        NavItem { label: "Dashboard", href: "/", icon: "home" },
        NavItem { label: "Clientes", href: "/customers", icon: "users" },
        NavItem { label: "Exemplos", href: "/examples", icon: "book" },
    ]
}
```

## Adicionar rota com shell

1. Criar página em `src/pages/<nome>.rs` ou `features/<bc>/presentation/`.
2. Registrar em `app.rs` dentro de `<AdminShell><Routes>…</Routes></AdminShell>`.
3. Adicionar item em `shell_navigation.rs`.

## Sidebar colapsável

O estado `sidebar_open` é um `RwSignal<bool>` em `AdminShell`. Em mobile, overlay fecha ao clicar fora.
