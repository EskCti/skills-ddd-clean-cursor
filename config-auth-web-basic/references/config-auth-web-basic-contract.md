# Config Auth Web Basic Contract

## Objetivo

Garantir que o frontend tenha o modulo de autenticacao web basico funcional, com fluxo de login/cadastro, rotas privadas/publicas, controle de acesso admin e telas de usuarios/perfil.

## Pre-requisitos de infraestrutura

- `apps/web/src/shared/index.ts` deve existir.
- `apps/web/src/shared/i18n/index.ts` deve existir.
- `apps/web/src/shared/components/form/validator/index.ts` deve existir.
- `apps/web/src/shared/components/ui/empty-dashboard-state.tsx` deve existir.
- `apps/web/src/shared/components/ui/sidebar-menu.component.tsx` deve existir.
- `apps/web/src/shared/template/app-shell.component.tsx` deve existir.

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
- `apps/web/src/modules/auth/template/private-app-shell.component.tsx`
- `apps/web/src/modules/auth/template/index.ts`

## Arquivos convergidos

- `apps/web/package.json` deve conter dependencias:
  - `<scope>/auth: "*"`
  - `<scope>/shared: "*"`
  - `lucide-react`
  - `react-hook-form`
  - `sonner`

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
- Composicao de shell privado:
  - `PrivateAppShell` em `modules/auth/template/private-app-shell.component.tsx`
  - `app/(private)/layout.tsx` deve aplicar apenas `ShellProvider` + `PrivateRoute`
  - `app/(private)/auth/layout.tsx` deve aplicar `AdminRoute` + `PrivateAppShell` com `AuthSidebarMenu`
  - `AuthSidebarMenu` deve usar `shared/components/ui/sidebar-menu.component.tsx`
  - qualquer `app/(private)/*/layout.tsx` (subpastas diretas) que nao estiver usando `PrivateAppShell` deve ser convergido automaticamente para usar
- Telas do modulo auth:
  - `SignInPage`
  - `SignUpPage`
  - `AuthDashboardPage` (renderizando `EmptyDashboardState` com `moduleName` de autenticacao)
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
- Preferencialmente o template deve manter placeholders `__AUTH_PACKAGE_NAME__`, `__SHARED_PACKAGE_NAME__` e `__PROJECT_SCOPE_SLUG__`; quando ausentes, a skill aplica fallback de replace por literais conhecidos.
