---
name: config-project-vue
stack: typescript
description: Inicializar ou continuar um projeto full-stack com backend NestJS e frontend Vue 3 com Tailwind CSS e PrimeVue, em monorepo com estrutura apps/backend + apps/web-vue. Usar quando o pedido envolver bootstrap de projeto Vue, setup NestJS + Vue 3, ou padronização de estrutura full-stack com Vue.
---

# Config Project (Vue)

## Overview

Executar setup determinístico para monorepo NestJS (backend) + Vue 3 + **Tailwind CSS v4** (layout/shell) + PrimeVue (widgets complexos), Composition API, Pinia e Vue Router.

> **Padrão de estilização**: consultar `../skills-standards.md` §4.1 e `references/tailwind-setup.md`.

## Estrutura alvo

```
project-root/
├── package.json
├── docker-compose.yml
├── .env / .env.example
├── apps/
│   ├── backend/                 # NestJS API
│   └── web-vue/                 # Vue 3 + PrimeVue
│       ├── src/
│       │   ├── components/
│       │   ├── views/           # páginas por rota
│       │   ├── stores/          # Pinia stores por BC
│       │   ├── router/
│       │   ├── services/        # chamadas à API
│       │   └── main.ts
│       ├── vite.config.ts
│       └── package.json
```

## Workflow

1. Verificar estrutura existente.
2. Inicializar backend NestJS em apps/backend/.
3. Inicializar frontend Vue 3 em apps/web-vue/ (npm create vue@latest — TypeScript + Vue Router + Pinia).
4. Instalar e configurar **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/vite`) — ver `references/tailwind-setup.md`.
5. Instalar PrimeVue 4 + @primevue/themes + PrimeIcons (widgets complexos).
6. Configurar PrimeVue no main.ts com tema Aura.
7. Configurar proxy Vite para /api → backend.
8. Configurar CORS no NestJS.
9. Executar scaffold E2E: `node config-project/scripts/ensure-e2e-scaffold.mjs --frontend-path apps/web-vue --frontend-port 5173`.
10. **Recomendado**: executar `config-shared-web-vue` para shell admin (sidebar, topbar, rodapé).

## References

- Consultar references/vue-project-pattern.md para estrutura detalhada.
- Consultar references/tailwind-setup.md para Tailwind v4 (padrão obrigatório).
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
