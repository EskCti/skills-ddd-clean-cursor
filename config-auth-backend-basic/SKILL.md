---
name: config-auth-backend-basic
description: Criar/recriar de forma determinística o módulo de autenticação do backend NestJS com endpoints HTTP (register/login/me/usuários/senha), JWT com Passport, controle de acesso admin, adapters Prisma compatíveis com `@namespace/auth`, modelo Prisma de auth, migrations SQL e seed JSON com usuários padrão. Usar quando o pedido envolver bootstrap/rebootstrap da camada backend auth completa no `apps/backend`.
---

# Config Auth Backend Basic

## Overview

Executar setup idempotente do módulo de autenticação backend no padrão Genérico, cobrindo:

- módulo NestJS simplificado em `apps/backend/src/modules/auth` com arquivos centrais:
  - `auth.controller.ts`
  - `auth.module.ts`
  - `jwt-auth.guard.ts`
  - `jwt.strategy.ts`
  - `require-admin.decorator.ts`
  - `require-admin.guard.ts`
  - `user.prisma.ts`
  - `password.prisma.ts`
  - `providers/bcrypt.provider.ts`
- endpoints de autenticação e usuário com `JwtAuthGuard` e proteção administrativa por `RequireAdminGuard`
- integração com `@namespace/auth` (use cases, entidades e providers)
- implementação Prisma (repositories/queries + model `.prisma` com flag `admin`)
- migrations de auth (criação inicial + evolução do campo `admin`)
- seed com usuários padrão em JSON (incluindo `id` UUID, `admin` e metadados de auditoria)

A skill aplica arquivos canônicos a partir de template versionado, convergindo arquivos existentes (`app.module.ts`, `apps/backend/package.json` e `prisma/seed/main.ts`) e removendo artefatos legados da implementação antiga.

## Workflow

1. Rodar simulação:
   - `node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --dry-run`
2. Aplicar mudanças:
   - `node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --apply`
3. Opcionalmente instalar dependências e validar build:
   - `node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --apply --install --run-build`
4. Rodar migration/seed no backend:
   - `npm --workspace apps/backend run prisma:migrate:dev -- --name auth-basic-init`
   - `npm --workspace apps/backend run prisma:seed`

## Commands

Aplicar módulo auth backend básico:

```bash
node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --apply
```

Aplicar e instalar dependências:

```bash
node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --apply --install
```

Aplicar, instalar e validar build:

```bash
node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --apply --install --run-build
```

Forçar namespace fallback quando não for possível detectar pacote auth automaticamente:

```bash
node .agents/skills/config-auth-backend-basic/scripts/init-config-auth-backend-basic.mjs --apply --scope @namespace
```

## Resources

- `scripts/init-config-auth-backend-basic.mjs`: orquestrador idempotente da skill.
- `assets/config-auth-backend-basic-template`: template canônico dos arquivos gerados.
- `references/config-auth-backend-basic-contract.md`: contrato de saída esperado.
- Log local: `.log/skills.log`.

## Output Contract

A skill deve convergir o backend para o contrato descrito em `references/config-auth-backend-basic-contract.md`, mantendo compatibilidade com o core `@namespace/auth` e com execução repetível sem duplicação estrutural.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
