# Shared Template Contract

## Goal

Inicializar `<sharedModulePath>` com o baseline completo do projeto:

- configs do pacote (`package.json`, `tsconfig.json`, `jest.config.ts`)
- código fonte (`src/base`, `src/db`, `src/dto`, `src/vo`, `src/index.ts`)
- testes (`test/base`, `test/vo`, `test/data`)
- VOs obrigatórios no template:
  - `src/vo/hash-password.vo.ts` com validação de hash bcrypt (`$2a$|$2b$|$2y$`, rounds com dois dígitos, payload `[./A-Za-z0-9]{53}`)
  - `src/vo/dot-separated-name.vo.ts`
  - `src/vo/name.vo.ts`
- testes obrigatórios correspondentes:
  - `test/vo/hash-password.vo.test.ts`
  - `test/vo/dot-separated-name.vo.test.ts`
  - `test/vo/name.vo.test.ts`
- exports obrigatórios em `src/vo/index.ts` para disponibilizar `HashPassword`, `DotSeparatedName` e `Name` via `src/index.ts`
- utilitário obrigatório de validação de resultado: `src/base/result-validator.ts` + `test/base/result-validator.test.ts` + export em `src/base/index.ts`
- contrato obrigatório de transação em `src/db/transaction.manager.ts` + export em `src/db/index.ts`

## Deterministic Source

O script usa exclusivamente:

- `assets/shared-template/**`

Não depende de geração dinâmica de código via LLM e não depende de shell específico.

## Command

```bash
node .agents/skills/config-shared-core/scripts/create-shared.mjs [--scope @namespace] [--force] [--run-tests]
```

> Se o repositório estiver em `.cloud/skills`, ajuste o caminho do comando.
> No fluxo padrão (sem `--target` customizado), o script executa `npm install` na raiz do projeto após gerar o módulo.
> No fluxo padrão, o script sincroniza `"@<namespace>/shared": "*"` apenas em frontend/backend e preserva dependências existentes nos demais pacotes.
> Com `--run-tests` + `--target` customizado, o script só executa `npm install` e `npm run test` no diretório alvo quando `../typescript-config/base.json` existir relativo ao target; caso contrário, registra skip explícito.

## Options

- `--scope`: substitui o namespace do `package.json` para `<scope>/<basename(sharedModulePath)>`.
- `--force`: remove o diretório de destino antes de copiar o template.
- `--run-tests`: executa `npm run test -w <scope>/shared` após gerar.
- `--target`: caminho absoluto/relativo alternativo para validar geração sem tocar em `<sharedModulePath>`.
  - quando `--target` é usado fora do caminho padrão, o script não executa `npm install` na raiz.
  - quando combinado com `--force`, o script bloqueia sobrescrita da raiz do repositório e da raiz do sistema.

## Namespace Resolution

Se `--scope` não for informado, usar esta precedência:

1. `PROJECT_NAMESPACE` ou `SKILLS_NAMESPACE`
2. `skills.config.local.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
3. `skills.config.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
4. scope do template em `assets/shared-template/package.json`
