# Module Template Contract

## Goal

Gerar um módulo novo de forma determinística em três áreas do monorepo:
- package: `<dirname(sharedModulePath)>/<module-name>`
- backend: `<backendAppPath>/src/modules/<module-name>`
- frontend: `<frontendAppPath>/src/modules/<module-name>` quando `src/` existir, ou `<frontendAppPath>/modules/<module-name>` quando não existir `src/`, além de `<frontendAppPath>/app/<module-name>`

## Required Files

### Package
- `package.json`
- `tsconfig.json`
- `jest.config.ts`
- `src/index.ts`
- `test/index.test.ts`

### Backend
- `<module-name>.controller.ts`
- `<module-name>.module.ts`
- Registro do `<ModuleName>Module` em `<backendAppPath>/src/app.module.ts`
- Dependência `<scope>/<module-name>` em `<backendAppPath>/package.json`

### Frontend
- `modules-base/<module-name>/components/<module-name>-dashboard.component.tsx`
- `modules-base/<module-name>/pages/dashboard.page.tsx`
- `app/<module-name>/page.tsx`
- Dependência `<scope>/<module-name>` em `<frontendAppPath>/package.json`

> `modules-base` = `src/modules` (se `src/` existir) ou `modules` (se `src/` não existir).

## Package Rules

- Nome do pacote: `<scope>/<module-name>`.
- Dependência obrigatória em `<scope>/<basename(sharedModulePath)>`.
- Dependência do módulo novo também deve ser adicionada em backend e frontend:
  - `<backendAppPath>/package.json` -> `<scope>/<module-name>: "*"`
  - `<frontendAppPath>/package.json` -> `<scope>/<module-name>: "*"`
- O nome real do módulo shared é derivado de `basename(sharedModulePath)`.
- Namespace por precedência:
  - `--scope`
  - `POUPIG_NAMESPACE` ou `SKILLS_NAMESPACE`
  - `skills.config.local.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
  - `skills.config.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
  - fallback de `packages/shared/package.json`
- Scripts padrão:
  - `dev: tsc --watch`
  - `build: tsc`
  - `test: jest --coverage`
  - `test:watch: jest --watchAll`

## Source Rules

- `src/index.ts` deve exportar a função:
  - `sum(a: number, b: number): number`
- `test/index.test.ts` deve validar o comportamento de `sum`.

## Backend Rules

- `controller` deve expor endpoint `GET /<module-name>` de exemplo.
- `module` deve declarar o controller no decorator `@Module`.
- O módulo novo deve ser importado e adicionado no array `imports` do `AppModule`.

## Frontend Rules

- O dashboard deve ser componente simples com label/título do módulo.
- A página de dashboard deve renderizar o componente de dashboard.
- A rota `app/<module-name>/page.tsx` deve renderizar a página principal do módulo.
- Pastas e arquivos do frontend devem seguir kebab-case em minúsculo.
- O arquivo de componente deve usar sufixo `.component.tsx`.
- O arquivo de página interna deve usar sufixo `.page.tsx`.

## Notes

- `--scope` permite forçar namespace explícito (`@polpig`, `@poupig`, etc.).
- Sem `--scope`, usar a precedência de configuração global da skill.
- `--force` permite sobrescrever os diretórios de package/backend/frontend do módulo.
- Seguir convenção global em `../../skills-standards.md`.
- Comando recomendado (cross-platform): `node .agents/skills/config-new-module/scripts/create-module.mjs <module-name>` (ou ajuste para `.cloud/skills` quando aplicável).
