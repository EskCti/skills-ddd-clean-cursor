# Naming Convention

## Objetivo

Padronizar nomenclatura de pastas e arquivos em todas as skills do projeto (`config`, `backend`, `core`, `frontend`, `prisma`) para manter previsibilidade e reduzir divergências.

## Regras Globais

- Pastas: sempre minúsculas, em kebab-case.
- Arquivos: sempre minúsculos, em kebab-case.
- Arquivos tipados: usar sufixo de tipo no nome, no formato `<nome>.<tipo>.<ext>`.
- Nome de módulo/domínio: sempre em kebab-case (ex.: `branch`, `product-category`, `auth-role`).

## Sufixos por Tipo

- Backend (Nest):
  - `*.controller.ts`
  - `*.module.ts`
  - `*.service.ts`
- Frontend (React/Next):
  - `*.component.tsx`
  - `*.page.tsx`
- Core (domínio/aplicação):
  - `*.entity.ts`
  - `*.value-object.ts` (ou `*.vo.ts` se o módulo já estiver nesse padrão legado)
  - `*.use-case.ts`
  - `*.repository.ts`
  - `*.query.ts`
  - `*.dto.ts`
  - `*.service.ts` (domain service)
- Prisma:
  - `*.model.prisma` para arquivos por módulo/domínio em `prisma/models/`

## Exemplos

- `apps/backend/src/modules/branch/branch.controller.ts`
- `apps/backend/src/modules/branch/branch.module.ts`
- `apps/web/src/modules/branch/components/branch-dashboard.component.tsx`
- `apps/web/src/modules/branch/pages/dashboard.page.tsx`
- `packages/branch/core/src/entity/branch.entity.ts`
- `apps/backend/prisma/models/branch.model.prisma`

## Exceções de Framework

- Arquivos convencionais exigidos por framework podem manter nome fixo:
  - Next App Router: `app/**/page.tsx`, `app/**/layout.tsx`
  - Entrypoints de seed/config quando explicitamente exigidos por ferramenta
