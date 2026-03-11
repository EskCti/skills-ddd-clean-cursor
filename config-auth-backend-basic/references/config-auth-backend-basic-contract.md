# Config Auth Backend Basic Contract

## Objetivo

Garantir que o backend tenha o módulo de autenticação básico funcional com integração ao core `auth`, Prisma, JWT e seed inicial.

## Artefatos obrigatórios

- `apps/backend/src/modules/auth/**`
- `apps/backend/prisma/models/auth.model.prisma`
- `apps/backend/prisma/migrations/20260311032045_auth/migration.sql`
- `apps/backend/prisma/migrations/migration_lock.toml`
- `apps/backend/prisma/seed/data/default-users.json`
- `apps/backend/prisma/seed/tasks/auth.seed.ts`

## Arquivos convergidos

- `apps/backend/src/app.module.ts` deve importar `AuthModule`.
- `apps/backend/package.json` deve conter dependências JWT/Passport/Bcrypt e pacote `auth` do workspace.
- `apps/backend/prisma/seed/main.ts` deve registrar `seedAuthDefaultUsers`.
- `apps/backend/prisma/models/bootstrap.model.prisma` não deve existir após convergência.

## Endpoints esperados

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (JWT)
- `GET /auth/users/by-email?email=...` (JWT)
- `GET /auth/users/:id` (JWT)
- `POST /auth/user/create` (JWT)
- `PATCH /auth/password/change` (JWT)
- `DELETE /auth/users/:id` (JWT)

## Estrutura simplificada esperada

- `apps/backend/src/modules/auth/auth.controller.ts`
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/jwt-auth.guard.ts`
- `apps/backend/src/modules/auth/jwt.strategy.ts`
- `apps/backend/src/modules/auth/user.prisma.ts`
- `apps/backend/src/modules/auth/password.prisma.ts`
- `apps/backend/src/modules/auth/providers/bcrypt.provider.ts`
- `apps/backend/src/modules/auth/test/auth.integration.http`
- `apps/backend/src/shared/decorators/current-user.decorator.ts`

## Regras de compatibilidade

- Use cases devem vir de `@namespace/auth`.
- Adapters Prisma devem respeitar contracts de `UserRepository`, `PasswordRepository` e queries do core.
- `JwtAuthGuard` deve ser aplicado nos endpoints protegidos.
- Seed de usuário padrão deve ser idempotente e ler dados de `default-users.json`.
- Modelo de senha não deve conter `isActive/is_active`; a senha vigente é obtida por ordenação de `createdAt DESC`.
