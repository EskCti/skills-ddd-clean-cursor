# Shared Template Contract

## Goal

Inicializar `<sharedModulePath>` com o baseline completo do projeto:

- configs do pacote (`package.json`, `tsconfig.json`, `jest.config.ts`)
- código fonte (`src/base`, `src/db`, `src/dto`, `src/vo`, `src/index.ts`)
- testes (`test/base`, `test/vo`, `test/data`)

## Deterministic Source

O script usa exclusivamente:

- `assets/shared-template/**`

Não depende de geração dinâmica de código via LLM e não depende de shell específico.

## Command

```bash
node .agents/skills/module-create-shared/scripts/createShared.mjs [--scope @poupig] [--force] [--run-tests]
```

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.

## Options

- `--scope`: substitui o namespace do `package.json` para `<scope>/<basename(sharedModulePath)>`.
- `--force`: remove o diretório de destino antes de copiar o template.
- `--run-tests`: executa `npm run test -w <scope>/shared` após gerar.
- `--target`: caminho absoluto/relativo alternativo para validar geração sem tocar em `<sharedModulePath>`.

## Namespace Resolution

Se `--scope` não for informado, usar esta precedência:

1. `POUPIG_NAMESPACE` ou `SKILLS_NAMESPACE`
2. `skills.config.local.json` (em `.agents/skills/config`, `.cloud/skills/config` ou `config/`)
3. `skills.config.json` (em `.agents/skills/config`, `.cloud/skills/config` ou `config/`)
4. scope do template em `assets/shared-template/package.json`
