# Config Auth Web Basic Contract

## Objetivo

Garantir que o frontend tenha o modulo de autenticacao web basico funcional, com fluxo de login/cadastro, rotas privadas/publicas, controle de acesso admin e telas de usuarios/perfil.

## Artefatos obrigatorios

- `apps/web/src/modules/auth/**`
- `apps/web/src/app/providers.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/(public)/layout.tsx`
- `apps/web/src/app/(private)/layout.tsx`
- `apps/web/src/app/(public)/auth/sign-in/page.tsx`
- `apps/web/src/app/(public)/auth/sign-up/page.tsx`
- `apps/web/src/app/(private)/auth/layout.tsx`
- `apps/web/src/app/(private)/auth/page.tsx`
- `apps/web/src/app/(private)/auth/users/page.tsx`
- `apps/web/src/app/(private)/auth/profile/page.tsx`

## Arquivos convergidos

- `apps/web/package.json` deve conter dependencias:
  - `<scope>/auth: "*"`
  - `<scope>/shared: "*"`
  - `react-hook-form`

## Endpoints consumidos pelo modulo web

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /auth/users`
- `GET /auth/users/by-email`
- `GET /auth/users/:id`
- `POST /auth/user/create`
- `PATCH /auth/users/:id`
- `PATCH /auth/password/change`
- `DELETE /auth/users/:id`

## Estrutura funcional esperada

- Provider global de auth (`AuthProvider`) com token em localStorage.
- Guards/components de rota:
  - `PrivateRoute`
  - `PublicOnlyRoute`
  - `AdminRoute`
  - `RequireAdmin`
- Telas do modulo auth:
  - `SignInPage`
  - `SignUpPage`
  - `AuthDashboardPage`
  - `UsersPage` (com dialogs modais de criar/editar/visualizar)
  - `ProfilePage` (dados do usuario, troca de senha e avatar)
- Campos de usuario com suporte a:
  - `name`
  - `email`
  - `password`
  - `avatarUrl`
  - indicador de perfil admin (`admin: boolean`)

## Regras de compatibilidade

- Tipos de dominio devem vir de `<scope>/auth`.
- Value objects/suporte compartilhado devem vir de `<scope>/shared`.
- Rotas auth publicas devem funcionar sem shell privado.
- Rotas privadas e administrativas devem respeitar autenticacao e perfil admin.
- Chave de token local deve usar slug de scope (`__PROJECT_SCOPE_SLUG__.access_token`) apos replace.
