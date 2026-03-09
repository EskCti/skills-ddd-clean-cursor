# Module Template Contract

## Goal

Gerar um módulo novo em `<dirname(sharedModulePath)>/<module-name>` com a base mínima para desenvolvimento TypeScript no monorepo.

## Required Files

- `package.json`
- `tsconfig.json`
- `jest.config.ts`
- `src/index.ts`
- `test/index.test.ts`

## Package Rules

- Nome do pacote: `<scope>/<module-name>`.
- Dependência obrigatória em `<scope>/<basename(sharedModulePath)>`.
- O nome real do módulo shared é derivado de `basename(sharedModulePath)`.
- Namespace por precedência:
  - `--scope`
  - `POUPIG_NAMESPACE` ou `SKILLS_NAMESPACE`
  - `skills.config.local.json` (em `.agents/skills/config`, `.cloud/skills/config` ou `config/`)
  - `skills.config.json` (em `.agents/skills/config`, `.cloud/skills/config` ou `config/`)
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

## Notes

- `--scope` permite forçar namespace explícito (`@polpig`, `@poupig`, etc.).
- Sem `--scope`, usar a precedência de configuração global da skill.
- Comando recomendado (cross-platform): `node .agents/skills/module-create/scripts/create-module.mjs <module-name>` (ou ajuste para `.cloud/skills` quando aplicável).
