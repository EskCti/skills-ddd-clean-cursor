---
name: config-project-angular
stack: typescript
description: Inicializar ou continuar um projeto full-stack com backend NestJS e frontend Angular 17+ (standalone components, signals) com Tailwind CSS, em monorepo com estrutura separada apps/backend + apps/web-angular. Usar quando o pedido envolver bootstrap de projeto Angular, setup NestJS + Angular, ou padronização de estrutura full-stack com Angular.
---

# Config Project (Angular)

## Overview

Executar setup determinístico para monorepo NestJS (backend) + Angular 17+ (frontend standalone) com **Tailwind CSS v4** (layout/shell) e PrimeNG (widgets complexos).

> **Padrão de estilização**: consultar `../skills-standards.md` §4.1 e `references/tailwind-setup.md`.

## Estrutura alvo

```
project-root/
├── package.json                 # root workspace (npm workspaces)
├── docker-compose.yml           # Postgres local
├── .env / .env.example
├── .gitignore
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web-angular/             # Angular 17+ app
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/        # guards, interceptors, services globais
│       │   │   ├── shared/      # componentes compartilhados
│       │   │   └── features/    # módulos por feature (BC)
│       │   ├── environments/
│       │   └── main.ts
│       ├── angular.json
│       └── package.json
```

## Workflow

1. Verificar estrutura existente.
2. Inicializar backend NestJS em apps/backend/ (nest new --skip-git).
3. Inicializar frontend Angular em apps/web-angular/ (ng new --standalone --routing --style=scss --skip-git).
4. Instalar e configurar **Tailwind CSS v4** (`tailwindcss`, `@tailwindcss/postcss`) — ver `references/tailwind-setup.md`.
5. Instalar PrimeNG + PrimeIcons (widgets complexos; **sem PrimeFlex**).
6. Configurar proxy Angular para /api → backend (proxy.conf.json).
7. Configurar CORS no NestJS.
8. Executar scaffold E2E: `node config-project/scripts/ensure-e2e-scaffold.mjs --frontend-path apps/web-angular --frontend-port 4200`.
9. Criar docker-compose.yml com Postgres.
10. Configurar .env com PORT e DATABASE_URL.
11. **Recomendado**: executar `config-shared-web-angular` para shell admin (sidebar, topbar, rodapé).

## Comandos

```bash
# Backend
cd apps/backend && npm run start:dev

# Frontend (com proxy para backend)
cd apps/web-angular && ng serve --proxy-config proxy.conf.json
```

## References

- Consultar references/angular-project-pattern.md para estrutura detalhada.
- Consultar references/tailwind-setup.md para Tailwind v4 (padrão obrigatório).
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
