---
name: config-shared-web-angular
stack: typescript
description: Bootstrap do shell web admin Angular 17+ com Tailwind CSS v4 — sidebar colapsável, topbar, rodapé, dashboard vazio e rotas de referência. Usar após config-project-angular quando o pedido envolver layout profissional, menu lateral ou shell reutilizável no frontend Angular.
---

# Config Shared Web (Angular)

## Overview

Executa bootstrap idempotente do **shell administrativo** no frontend Angular (`apps/web-angular` por padrão):

- Tailwind CSS v4 + tokens de tema
- **AdminShell**: sidebar esquerda colapsável, topbar, área principal, **rodapé**
- **SidebarMenu** parametrizável
- Dashboard vazio + página Examples
- `app.routes.shell.ts` para merge com rotas existentes

> Consultar `../skills-standards.md` §4.1 (Tailwind como padrão).

## Workflow

1. Garantir que `config-project-angular` já rodou (`apps/web-angular/package.json` existe).
2. Executar:

```bash
node .agents/skills/config-shared-web-angular/scripts/init-shared-web-angular.mjs \
  --frontend-path apps/web-angular \
  --theme fuchsia \
  --mode dark
```

3. Integrar rotas — mesclar `shellRoutes` de `src/app/app.routes.shell.ts` em `app.routes.ts`.
4. Aplicar classe de modo no `index.html`:

```html
<body class="dark">
```

5. Garantir `angular.json` → `styles`: `["src/styles.scss"]`.

## Commands

```bash
node .agents/skills/config-shared-web-angular/scripts/init-shared-web-angular.mjs
node .agents/skills/config-shared-web-angular/scripts/init-shared-web-angular.mjs --dry-run
node .agents/skills/config-shared-web-angular/scripts/init-shared-web-angular.mjs --skip-install
```

## O que o script garante

| Artefato | Descrição |
|----------|-----------|
| `src/styles.scss` | Tailwind v4 + tokens CSS |
| `postcss.config.json` | Plugin `@tailwindcss/postcss` |
| `layout/admin-shell/` | Shell completo com header + sidebar + footer |
| `layout/sidebar-menu/` | Menu lateral com seções |
| `shared/services/shell.service.ts` | Estado sidebar desktop/mobile |
| `features/dashboard/` | Dashboard vazio |
| `app.routes.shell.ts` | Rotas prontas para merge |

## Integração de rotas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { shellRoutes } from './app.routes.shell';

export const routes: Routes = [
  // rotas públicas (login) aqui
  ...shellRoutes,
];
```

## References

- `references/integrate-shell.md` — merge de rotas e customização do menu
- `../config-project-angular/references/tailwind-setup.md`
- `../config-shared-web/SKILL.md` — referência equivalente Next.js

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
