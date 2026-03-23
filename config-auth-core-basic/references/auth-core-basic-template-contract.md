# Auth Core Basic Template Contract

## Goal

Inicializar o módulo auth no caminho padrão detectado (`packages/auth` ou `packages/auth/core`) com baseline determinístico mínimo para autenticação:

- configs do pacote (`package.json`, `tsconfig.json`, `jest.config.ts`)
- código fonte (`src/user`, `src/password`, `src/application`, `src/index.ts`)
- testes (`test/user`, `test/password`, `test/root`)

Sem escopo de geração:

- `permission`
- `role`
- `audit`
- `oauth`
- casos de uso de perfil

## Required Rules

- Nome do pacote: `<scope>/auth`
- Dependência obrigatória de shared: `<scope>/<basename(sharedModulePath)>`
- Dependência `<scope>/auth` deve ser sincronizada em:
  - `apps/backend/package.json` (`dependencies`)
  - `apps/web/package.json` (`dependencies`)
- Após sincronização, executar `npm install` no root do monorepo para atualizar resolução/workspaces.
- `Password` deve validar `HashPassword` (senha criptografada) e não possuir status/ativação interna
- `Password` não deve validar `StrongPassword`
- `PasswordChangePolicyService` deve validar:
  - confirmação (`newPassword === confirmPassword`)
  - força de senha (`StrongPassword`)
  - reuso das últimas senhas por `PasswordCryptoProvider.compare`
- `CreateUserUseCase` deve:
  - validar existência prévia de usuário por `UserExistsQuery`
  - aceitar `avatarUrl` opcional e normalizar com trim antes de persistir
  - usar `TransactionManager.runInTransaction` para persistir `User` e depois `Password` (hash) no mesmo fluxo transacional
- `UserRepository.create` e `PasswordRepository.create` devem aceitar `tx?: TransactionContext`
- `User` deve expor:
  - `avatarUrl` opcional
  - `admin` opcional com default `false`
- `LoginUseCase` deve comparar senha via `PasswordCryptoProvider`
- `ChangePasswordUseCase` deve:
  - validar usuário por `UserExistsQuery`
  - buscar histórico recente por `PasswordRepository.findRecentByUserId`
  - aplicar `PasswordChangePolicyService`
  - salvar nova senha hash por `PasswordRepository.create`

## Command

```bash
node .agents/skills/config-auth-core-basic/scripts/create-auth-core-basic.mjs [--scope @namespace] [--force] [--run-tests] [--target <path>] [--skip-apps-sync] [--skip-install]
```

> Com `--run-tests`, a execução de testes ocorre apenas quando o alvo é o caminho padrão detectado do workspace (`packages/auth` ou `packages/auth/core`); em `--target` customizado o script registra skip explícito para manter previsibilidade.

## Namespace Resolution

Se `--scope` não for informado, usar esta precedência:

1. `PROJECT_NAMESPACE` ou `SKILLS_NAMESPACE`
2. `skills.config.local.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
3. `skills.config.json` (em `.agents/skills/.env`, `.cloud/skills/.env` ou `.env/`)
4. scope do template em `assets/auth-core-basic-template/package.json`

## Deterministic Source

O script usa exclusivamente:

- `assets/auth-core-basic-template/**`

Não depende de geração dinâmica de código via LLM e não depende de shell específico.
