---
name: core-dioxus-widget-rs
stack: rust
description: Criar widgets/componentes reutilizáveis Dioxus com props tipadas e estilização Tailwind/CSS modules. Usar quando pedir componente isolado, widget reusável, botão, card, input, ou UI kit Dioxus Mobile.
---

# Core Dioxus — Widgets

## Overview

Padrão para componentes reutilizáveis (widgets) em Dioxus Mobile, com **Props tipadas** e sem acoplamento ao domínio.

## Config

- Widgets em `widgets/<nome>.rs` — kebab-case nos arquivos, PascalCase no componente.
- `#[derive(Props, PartialEq)]` para `struct <Nome>Props`.
- Estilização com classes utilitárias (Tailwind/Dioxus-class) ou CSS modules sob controle do projeto — nunca estilos inline espalhados.
- Widgets **não** conhecem use cases nem repositórios (presentation pura).

## Exemplo

```rust
use dioxus::prelude::*;

#[derive(Props, Clone, PartialEq)]
struct CustomerAvatarProps {
    name: String,
    #[props(default)]
    size: String,
}

#[component]
fn CustomerAvatar(props: CustomerAvatarProps) -> Element {
    let initials = props
        .name
        .split_whitespace()
        .filter_map(|w| w.chars().next())
        .take(2)
        .collect::<String>();
    rsx! {
        div { class: "flex items-center justify-center rounded-full bg-primary text-primary-foreground {props.size}", "{initials}&#160;" }
    }
}
```

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura.