---
name: config-docker
stack: typescript
description: Criar ou revisar Dockerfiles multi-stage para produção em projetos TypeScript (NestJS backend + Next.js frontend), otimizando imagem final via build de camadas, .dockerignore e docker-compose para ambiente de produção/staging. Usar quando o pedido envolver Dockerfile, imagem Docker, build de produção, containerização ou docker-compose de produção para stack TypeScript/NestJS/Next.js.
---

# Config Docker (TypeScript)

## Overview

Gerar Dockerfiles multi-stage otimizados para produção no monorepo TurboRepo com backend NestJS e frontend Next.js.

> O `docker-compose.yml` de **desenvolvimento local** (apenas banco) é gerado pelo `config-prisma`. Este skill cobre **build de produção** com multi-stage e imagem final enxuta.

## Estrutura gerada

```
project-root/
├── apps/
│   ├── backend/
│   │   └── Dockerfile          ← multi-stage NestJS
│   └── web/
│       └── Dockerfile          ← multi-stage Next.js
├── docker-compose.prod.yml     ← orquestra backend + web + db
└── .dockerignore               ← exclui node_modules, .next, dist
```

## Workflow

1. Verificar se `apps/backend/` e `apps/web/` existem.
2. Criar `apps/backend/Dockerfile` com estágio `builder` (build) e `runner` (produção) + saúde: copiar `packages/` antes do `npm ci --workspace`, e adicionar `HEALTHCHECK` checando a porta 4000.
3. Criar `apps/web/Dockerfile` com estágio `builder` (build Next.js) e `runner` (standalone).
4. Criar `.dockerignore` na raiz cobrindo `node_modules`, `.next`, `dist`, `.env*`, logs.
5. Criar `docker-compose.prod.yml` orquestrando backend, web e postgres.
6. Validar: `docker build -f apps/backend/Dockerfile .` e `docker build -f apps/web/Dockerfile .`.

## References

- Consultar `references/docker-pattern.md` para templates completos de Dockerfile.
- Consultar `../skills-standards.md` para convenções globais.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
