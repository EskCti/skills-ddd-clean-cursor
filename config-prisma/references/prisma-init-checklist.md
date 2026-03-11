# Prisma Init Checklist (Genérico Backend)

## Objetivo

Padronizar bootstrap do Prisma no backend NestJS com:

- schema modular em `apps/backend/prisma/models/*.model.prisma`
- entrypoint de seed em `apps/backend/prisma/seed/main.ts`
- módulo Nest de banco em `apps/backend/src/db/*`
- Docker Compose do backend compatível com `DATABASE_URL`

## Pré-requisitos

- Workspace com `apps/backend/package.json`
- `DATABASE_URL` definido em `apps/backend/.env` (ou em `.env.example`)
- Node.js/NPM instalados
- Docker/Docker Compose instalados

## Passo a passo

1. Rodar simulação.
2. Aplicar bootstrap.
3. Instalar dependências.
4. Subir Postgres com Docker Compose.
5. Gerar client Prisma.
6. Rodar seed.

```bash
node .agents/skills/config-prisma/scripts/init-prisma-backend.js --dry-run
node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --install
npm --workspace apps/backend run db:start
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run prisma:seed
```

## Escaffold de módulos Prisma

```bash
node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --module auth --module stock --module billing
```

## Arquivos críticos

- `apps/backend/package.json`
- `apps/backend/.env`
- `apps/backend/.env.example`
- `apps/backend/docker-compose.yml`
- `apps/backend/prisma.config.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/seed/main.ts`
- `apps/backend/src/db/db.module.ts`
- `apps/backend/src/db/prisma.service.ts`
- `apps/backend/src/app.module.ts`

## Flags

- `--apply`: aplica alterações em disco
- `--dry-run`: simula alterações
- `--install`: roda `npm install --workspace <workspace-backend>` usando o nome em `apps/backend/package.json` (fallback `apps/backend`)
- `--start-db`: roda `docker compose up -d postgres` no `apps/backend`
- `--module <nome>`: cria arquivo Prisma por módulo
- `--prisma-version <semver>`: força versão de Prisma

## Pós-bootstrap

- Adicionar modelos reais em `prisma/models/*.model.prisma`
- Gerar migrações (`prisma migrate dev`)
- Implementar seeds por módulo e registrá-las em `prisma/seed/main.ts`
- Atualizar adapters `*.prisma.ts` para mapear domínio/DTO
- Remover `prisma/models/bootstrap.model.prisma` após entrada dos modelos reais e gerar migration de substituição
- Em rebootstrap de projetos antigos, o script corrige automaticamente `prisma/seed/main.ts` legado quando detecta imports de `generated/prisma` ou `cid`.
- Seguir convenção global em `../../skills-standards.md`.
