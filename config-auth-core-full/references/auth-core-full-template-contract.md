# Auth Core Full Template Contract

## Goal

Inicializar o módulo auth core completo no caminho padrão detectado (`packages/auth` ou `packages/auth/core`) com baseline determinístico para autenticação full:

- configs do pacote (`package.json`, `tsconfig.json`, `jest.config.ts`)
- código fonte (`src/user`, `src/password`, `src/application`, `src/role`, `src/permission`, `src/oauth`, `src/index.ts`)
- testes (`test/user`, `test/password`, `test/root`, `test/role`, `test/permission`, `test/oauth`)

Sem escopo de geração:

- `audit`

## Required Rules

- Nome do pacote: `<scope>/auth`
- Dependência obrigatória de shared: `<scope>/<basename(sharedModulePath)>`
- Dependência `<scope>/auth` deve ser sincronizada em:
  - `apps/backend/package.json` (`dependencies`)
  - `apps/web/package.json` (`dependencies`)
- Após sincronização, executar `npm install` no root do monorepo para atualizar resolução/workspaces.
- O template deve conter autenticação por email/senha e suporte de OAuth no core (`src/oauth/**`).
- O template não pode conter nenhum arquivo nem referência a `audit`.
- `Password` deve validar `HashPassword` (senha criptografada) e não validar `StrongPassword` diretamente.
- `ChangePasswordUseCase` deve aplicar política de troca e evitar reuso recente via `PasswordCryptoProvider.compare`.
- `CreateUserUseCase` deve usar `TransactionManager.runInTransaction` para persistir `User` e `Password` no mesmo fluxo transacional.

## Command

```bash
node .agents/skills/config-auth-core-full/scripts/create-auth-core-full.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>] [--skip-apps-sync] [--skip-install]
```

## Namespace Resolution

Se `--scope` não for informado, usar esta precedência:

1. `PROJECT_NAMESPACE` ou `SKILLS_NAMESPACE`
2. `skills.config.local.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
3. `skills.config.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
4. scope do template em `assets/auth-core-full-template/package.json`

## Deterministic Source

O script usa exclusivamente:

- `assets/auth-core-full-template/**`

Não depende de geração dinâmica de código via LLM e não depende de shell específico.
