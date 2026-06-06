# Tailwind CSS v4 — Leptos (cargo-leptos)

## Instalação

Na raiz do workspace (ou em `crates/web-leptos/`):

```bash
npm init -y
npm install -D tailwindcss @tailwindcss/cli
```

## style/main.css

```css
@import "tailwindcss";

@theme {
  --color-primary: #d946ef;
  --color-background: oklch(0.145 0 0);
  --color-foreground: oklch(0.985 0 0);
  --color-muted: oklch(0.269 0 0);
  --color-border: oklch(0.269 0 0);
}

@layer base {
  html.dark {
    color-scheme: dark;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

## Build CSS com cargo-leptos

Adicionar em `Leptos.toml`:

```toml
[build]
site-root = "target/site"
# Tailwind: gerar CSS antes do build Leptos
# Opção A — script npm na raiz:
#   "build:css": "npx @tailwindcss/cli -i crates/web-leptos/style/main.css -o crates/web-leptos/style/output.css"
# Opção B — tailwind watch em terminal separado durante dev
```

Em dev, rodar em paralelo:

```bash
npx @tailwindcss/cli -i crates/web-leptos/style/main.css -o crates/web-leptos/style/output.css --watch
cargo leptos watch
```

Referenciar `output.css` em `app.rs` via `<Stylesheet href="/pkg/web-leptos.css"/>` (cargo-leptos copia assets de `style/`).

## Regras

- Layout, espaçamento, cores → classes Tailwind (`flex`, `grid`, `p-*`, `md:`).
- Tabelas e formulários simples → HTML + Tailwind (sem UI kit obrigatório).
- Tokens CSS alinhados a `config-shared-web/templates/base` (`--background`, `--primary`).
