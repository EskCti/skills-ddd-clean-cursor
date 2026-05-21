---
name: config-shared-web-vue
stack: typescript
description: Bootstrap do shell web admin Vue 3 com Tailwind CSS v4 — sidebar colapsável, topbar, rodapé, dashboard vazio e rotas de referência. Usar após config-project-vue quando o pedido envolver layout profissional, menu lateral ou shell reutilizável no frontend Vue.
---

# Config Shared Web (Vue)

## Overview

Executa bootstrap idempotente do **shell administrativo** no frontend Vue (`apps/web-vue` por padrão):

- Tailwind CSS v4 + tokens de tema (`@tailwindcss/vite`)
- **AdminShell**: sidebar esquerda colapsável, topbar, área principal, **rodapé**
- **SidebarMenu** parametrizável
- Dashboard vazio + página Examples
- `router/shell.routes.ts` para merge com rotas existentes

> Consultar `../skills-standards.md` §4.1 (Tailwind como padrão).

## Workflow

1. Garantir que `config-project-vue` já rodou (`apps/web-vue/package.json` existe).
2. Executar:

```bash
node .agents/skills/config-shared-web-vue/scripts/init-shared-web-vue.mjs \
  --frontend-path apps/web-vue \
  --theme fuchsia \
  --mode dark
```

3. Integrar rotas — mesclar `shellRoutes` de `src/router/shell.routes.ts` em `router/index.ts`.
4. Importar CSS no `main.ts`: `import './assets/main.css'`.
5. Adicionar plugin Tailwind no `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'
// plugins: [vue(), tailwindcss()]
```

6. Aplicar classe de modo no `index.html`: `<html class="dark">`.

## Commands

```bash
node .agents/skills/config-shared-web-vue/scripts/init-shared-web-vue.mjs
node .agents/skills/config-shared-web-vue/scripts/init-shared-web-vue.mjs --dry-run
node .agents/skills/config-shared-web-vue/scripts/init-shared-web-vue.mjs --skip-install
```

## O que o script garante

| Artefato | Descrição |
|----------|-----------|
| `src/assets/main.css` | Tailwind v4 + tokens CSS |
| `layouts/AdminShell.vue` | Shell completo com header + sidebar + footer |
| `components/SidebarMenu.vue` | Menu lateral com seções |
| `composables/useShell.ts` | Estado sidebar desktop/mobile |
| `views/DashboardView.vue` | Dashboard vazio |
| `router/shell.routes.ts` | Rotas prontas para merge |

## Integração de rotas

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { shellRoutes } from './shell.routes'

export default createRouter({
  history: createWebHistory(),
  routes: [
    // rotas públicas (login) aqui
    ...shellRoutes,
  ],
})
```

## References

- `references/integrate-shell.md` — merge de rotas e customização do menu
- `../config-project-vue/references/tailwind-setup.md`
- `../config-shared-web/SKILL.md` — referência equivalente Next.js

## Global Standards

- Consultar `../skills-standards.md` para padrões globais.
