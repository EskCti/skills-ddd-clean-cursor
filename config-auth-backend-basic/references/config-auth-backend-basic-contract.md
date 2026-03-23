# Config Auth Backend Basic Contract

## Objetivo

Garantir que o backend tenha o módulo de autenticação básico funcional com integração ao core `auth`, Prisma, JWT e seed inicial.

## Pré-requisitos de infraestrutura

- `apps/backend/src/db/db.module.ts` deve existir.
- `apps/backend/src/db/prisma.service.ts` deve existir e expor `runInTransaction` com contrato `TransactionManager`.

## Artefatos obrigatórios

- `apps/backend/src/modules/auth/**`
- `apps/backend/prisma/models/auth.model.prisma`
- `apps/backend/prisma/migrations/20260311032045_auth/migration.sql`
- `apps/backend/prisma/migrations/20260311191936_add_user_admin_flag/migration.sql`
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
- `GET /auth/users` (JWT + admin)
- `GET /auth/users/by-email?email=...` (JWT + admin)
- `PATCH /auth/users/:id` (JWT + admin)
- `GET /auth/users/:id` (JWT + admin, com exceção opcional allow-self)
- `POST /auth/user/create` (JWT + admin)
- `PATCH /auth/password/change` (JWT)
- `DELETE /auth/users/:id` (JWT + admin)

## Estrutura simplificada esperada

- `apps/backend/src/modules/auth/auth.controller.ts`
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/jwt-auth.guard.ts`
- `apps/backend/src/modules/auth/jwt.strategy.ts`
- `apps/backend/src/modules/auth/require-admin.decorator.ts`
- `apps/backend/src/modules/auth/require-admin.guard.ts`
- `apps/backend/src/modules/auth/user.prisma.ts`
- `apps/backend/src/modules/auth/password.prisma.ts`
- `apps/backend/src/modules/auth/providers/bcrypt.provider.ts`
- `apps/backend/src/modules/auth/test/auth.integration.http`
- `apps/backend/src/shared/decorators/current-user.decorator.ts`

## Regras de compatibilidade

- Use cases devem vir de `@namespace/auth`.
- Adapters Prisma devem respeitar contracts de `UserRepository`, `PasswordRepository` e queries do core.
- `CreateUserUseCase` deve receber `PrismaService` (como `TransactionManager`) nos fluxos de criação (`register` e `user/create`).
- Métodos de escrita dos adapters Prisma (`user.prisma.ts` e `password.prisma.ts`) devem aceitar `TransactionContext` opcional e resolver o client transacional quando disponível.
- `JwtAuthGuard` deve ser aplicado nos endpoints protegidos.
- `RequireAdminGuard` deve proteger endpoints administrativos e permitir `allowSelfByParam` quando configurado.
- Seed de usuários padrão deve ser idempotente, ler dados de `default-users.json` e respeitar campos `id` UUID, `admin`, `createdAt`, `updatedAt` e `deletedAt`.
- Modelo de senha não deve conter `isActive/is_active`; a senha vigente é obtida por ordenação de `createdAt DESC`.
