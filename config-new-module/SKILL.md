---
name: config-new-module
description: Criar um novo módulo de forma determinística no padrão do projeto Workspace, gerando scaffold em `packages/*`, `apps/backend/src/modules/*` e `apps/web` (modules + rota principal). Usar quando o pedido envolver criação de módulo full-stack no monorepo com package TypeScript, módulo NestJS e dashboard inicial no web.
---

# Config New Module

## Overview

Padronizar a criação de novos módulos no monorepo com três entregas sincronizadas:

1. pacote em `<dirname(sharedModulePath)>/<module-name>` (template TypeScript);
2. módulo backend em `<backendAppPath>/src/modules/<module-name>` (Nest module + controller + provider Prisma de módulo) e modelo Prisma inicial em `<backendAppPath>/prisma/models/<module-name>.model.prisma`;
3. módulo frontend em `<frontendAppPath>/src/modules/<module-name>` quando `src/` existir; caso não exista, em `<frontendAppPath>/modules/<module-name>`, sempre com pastas `components`, `pages` e `data`, e rota principal em `app/(private)/<module-name>/page.tsx` quando o grupo `(private)` existir (fallback para `app/<module-name>/page.tsx`).

Executar o script Node da skill para receber o nome do módulo e gerar os arquivos mínimos de código e teste, sem depender de shell específico de SO.
O namespace e diretórios padrão devem ser resolvidos por configuração global compartilhada em `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`).

## Workflow

1. Ler o nome do módulo solicitado pelo usuário.
2. Executar `node scripts/create-module.mjs <module-name>`.
3. Namespace é resolvido por precedência: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > `skills.config.local.json` > `skills.config.json` > fallback automático.
4. Conferir a estrutura criada em:
   - `<dirname(sharedModulePath)>/<module-name>`
   - `<backendAppPath>/src/modules/<module-name>`
   - `<backendAppPath>/prisma/models/<module-name>.model.prisma`
   - `<frontendAppPath>/src/modules/<module-name>` **ou** `<frontendAppPath>/modules/<module-name>` (conforme existência da pasta `src`)
   - `<frontendAppPath>/<app-base>/(private)/<module-name>` **ou** `<frontendAppPath>/<app-base>/<module-name>` (fallback)
5. Confirmar que o package contém API mínima (`getModuleName`) e teste `index.test.ts`.
6. Confirmar que o backend contém `<module-name>.module.ts`, `<module-name>.controller.ts`, `<module-name>.prisma.ts`, e que o módulo foi registrado no `app.module.ts`.
7. Confirmar que o frontend contém estrutura de menu (`data`), dashboard template e rota principal para acessar o módulo.
   - o componente `<module-name>-dashboard.component.tsx` deve usar `EmptyDashboardState` de `modules/dashboard/components/empty-dashboard-state.component.tsx` quando esse componente existir no projeto.
8. Confirmar que `apps/backend/package.json` e `apps/web/package.json` possuem a dependência `<scope>/<module-name>`.
9. Registrar execução em `.log/skills.log` com título da skill e lista simples dos comandos/ações relevantes (sem timestamps e sem status), garantindo `.log/` no `.gitignore`.

## Commands

Criar módulo no namespace padrão do projeto:

```bash
node .agents/skills/config-new-module/scripts/create-module.mjs <module-name>
```

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.

Definir namespace por variável de ambiente:

```bash
PROJECT_NAMESPACE=@namespace node .agents/skills/config-new-module/scripts/create-module.mjs <module-name>
```

Criar módulo com namespace explícito:

```bash
node .agents/skills/config-new-module/scripts/create-module.mjs <module-name> --scope @namespace
```

Sobrescrever diretório existente:

```bash
node .agents/skills/config-new-module/scripts/create-module.mjs <module-name> --force
```

## Output Contract

O script deve gerar exatamente:

- `<dirname(sharedModulePath)>/<module-name>/package.json`
- `<dirname(sharedModulePath)>/<module-name>/tsconfig.json`
- `<dirname(sharedModulePath)>/<module-name>/jest.config.ts`
- `<dirname(sharedModulePath)>/<module-name>/src/index.ts`
- `<dirname(sharedModulePath)>/<module-name>/test/index.test.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.controller.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.prisma.ts`
- `<backendAppPath>/src/modules/<module-name>/<module-name>.module.ts`
- `<backendAppPath>/src/modules/<module-name>/index.ts`
- `<backendAppPath>/prisma/models/<module-name>.model.prisma`
- atualização em `<backendAppPath>/src/app.module.ts` para importar e registrar `<ModuleName>Module`
- `<frontendAppPath>/src/modules/<module-name>/components/<module-name>-dashboard.component.tsx` **ou** `<frontendAppPath>/modules/<module-name>/components/<module-name>-dashboard.component.tsx`
- `<frontendAppPath>/src/modules/<module-name>/data/<module-name>-menu.data.ts` **ou** `<frontendAppPath>/modules/<module-name>/data/<module-name>-menu.data.ts`
- `<frontendAppPath>/src/modules/<module-name>/pages/dashboard.page.tsx` **ou** `<frontendAppPath>/modules/<module-name>/pages/dashboard.page.tsx`
- `<frontendAppPath>/src/modules/<module-name>/index.ts` **ou** `<frontendAppPath>/modules/<module-name>/index.ts`
- `<frontendAppPath>/src/app/(private)/<module-name>/page.tsx` quando `(private)` existir, senão `<frontendAppPath>/src/app/<module-name>/page.tsx` (ou equivalente sem `src/`)
- atualização em `<backendAppPath>/package.json` com dependência `<scope>/<module-name>`
- atualização em `<frontendAppPath>/package.json` com dependência `<scope>/<module-name>`

Regra do dashboard do módulo:

- quando existir `modules/dashboard/components/empty-dashboard-state.component.tsx`, o arquivo `<module-name>-dashboard.component.tsx` deve referenciar `EmptyDashboardState` como conteúdo principal do dashboard.

## Naming Convention

- Pastas: sempre minúsculas em kebab-case.
- Arquivos: sempre minúsculos em kebab-case, com sufixo de tipo no nome (ex.: `branch.controller.ts`, `branch.module.ts`, `branch-dashboard.component.tsx`, `dashboard.page.tsx`).
- Convenção global compartilhada: `../skills-standards.md`.

Consultar `references/module-template.md` para o contrato completo dos arquivos gerados.

## Shared Config

- Arquivo versionado: `skills.config.json` (`.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
- Override local (gitignored): `skills.config.local.json` no mesmo diretório da configuração principal
- Exemplo local: `skills.config.local.example.json` no mesmo diretório da configuração principal
- Log local de execução: `.log/skills.log` (não versionado; `.log/` é adicionado ao `.gitignore` automaticamente, sem metadados extras).

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
