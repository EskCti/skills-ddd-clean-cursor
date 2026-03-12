---
name: config-prisma
description: "Inicializar e padronizar a infraestrutura do Prisma no backend NestJS do Genérico com schema modular por domínio (`apps/backend/prisma/models/*.model.prisma`), entrypoint de seed técnico em `apps/backend/prisma/seed/main.ts` (sem seeds de módulos), configuração de `prisma.config.ts`, Docker Compose do backend compatível com `DATABASE_URL` do `.env`, e criação/ajuste de `DbModule` + `PrismaService` compatível com `TransactionManager`/`runInTransaction`. Usar quando o pedido envolver setup inicial de Prisma, onboarding de módulos com arquivo Prisma próprio ou rebootstrap da infraestrutura de banco no backend."
---

# Config Prisma

## Overview

Executar setup determinístico da infraestrutura Prisma no `apps/backend`, com seed entrypoint neutro (sem tasks de módulo), módulo de banco no Nest e inicialização do Postgres via Docker Compose alinhada ao `.env`.
O contrato gerado de banco deve ficar compatível com a versão atual do projeto: `PrismaService` implementando `TransactionManager` e expondo `runInTransaction` para casos de uso transacionais (ex.: auth).

## Workflow

1. Confirmar que o workspace contém `apps/backend/package.json`.
2. Executar o script da skill:
   - `node .agents/skills/config-prisma/scripts/init-prisma-backend.js --dry-run`
   - `node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --install`
3. Incluir arquivos Prisma por módulo (repetível):
   - `node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --module auth --module product`
4. Subir banco com Docker Compose do backend:
   - `npm --workspace apps/backend run db:start`
5. Validar Prisma:
   - `npm --workspace apps/backend run prisma:generate`

## O que o script garante

- Dependências Prisma no `apps/backend/package.json` (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `tsx`) com preservação da versão já existente quando o backend já está configurado (sem upgrade forçado por padrão).
- Scripts npm de banco/Prisma (`db:start`, `db:stop`, `db:logs`, `prisma:generate`, `prisma:migrate:*`, `prisma:seed`, `prisma:studio`).
- Remoção de script legado `prisma:cid` quando presente.
- `apps/backend/prisma.config.ts` com `seed: 'npx tsx prisma/seed/main.ts'`.
- `apps/backend/prisma/schema.prisma` com `generator client { provider = "prisma-client-js" }` no padrão atual.
- `apps/backend/prisma/seed/main.ts` inicial (sem implementação de módulos) usando `PrismaClient` de `@prisma/client` com `PrismaPg`.
- Autocorreção apenas para templates legados de seed (`generated/client`, `generated/prisma`, `cid`) sem sobrescrever seeds modernos já estruturados com tasks de módulo.
- Não cria nem altera `prisma/seed/tasks/*` de módulos específicos.
- `apps/backend/prisma/models/bootstrap.model.prisma` temporário apenas quando ainda não existe nenhum `*.model.prisma` de domínio.
- Arquivos de módulos Prisma no padrão `<module-name>.model.prisma`.
- `apps/backend/docker-compose.yml` alinhado ao `DATABASE_URL` carregado de `apps/backend/.env` (fallback para `.env.example`).
- Criação/ajuste de `apps/backend/src/db/db.module.ts` e `apps/backend/src/db/prisma.service.ts`.
- `PrismaService` com contrato transacional atual:
  - implementa `TransactionManager<PrismaTransactionContext>`
  - expõe `runInTransaction`
  - define `PrismaTransactionContext` com `client: Prisma.TransactionClient`.
- Inclusão de `DbModule` em `apps/backend/src/app.module.ts` quando ausente.

## Notes

- O script é idempotente: pode ser executado várias vezes sem duplicar estrutura.
- O script instala usando o nome real do workspace lido de `apps/backend/package.json` (fallback: `apps/backend`).
- Após criar modelos reais, remover `prisma/models/bootstrap.model.prisma` (se existir) e gerar nova migration.
- Em backends já evoluídos, o script evita regressão de `seed/main.ts` para template neutro quando o arquivo já estiver no padrão moderno com tasks registradas.
- Seguir convenção global em `../skills-standards.md`.
- Consultar `references/prisma-init-checklist.md` para checklist operacional.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
