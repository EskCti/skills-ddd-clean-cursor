---
name: config-cicd
stack: typescript
description: Criar ou revisar pipeline GitHub Actions para projetos TypeScript (NestJS + Next.js), cobrindo lint, testes unitários, build Docker, push para registry e deploy. Usar quando o pedido envolver GitHub Actions, CI/CD, pipeline, workflow, deploy automatizado ou configuração de integração contínua para stack TypeScript/NestJS/Next.js.
---

# Config CI/CD (TypeScript)

## Overview

Gerar workflows GitHub Actions para monorepo TurboRepo com NestJS backend e Next.js frontend, cobrindo CI (lint + test + **coverage gate ≥95% domain/application** + build) e CD (build Docker + push + deploy).

## Estrutura gerada

```
project-root/
├── scripts/
│   └── check-coverage.mjs  ← gate ≥95% domain+application
└── .github/
    └── workflows/
        ├── ci.yml          ← lint + test + coverage gate
        └── cd.yml          ← build Docker + push + deploy
```

## Workflow

1. Verificar se `.github/workflows/` existe; criar se necessário.
2. Copiar `assets/check-coverage.mjs` deste skill para `scripts/check-coverage.mjs` no projeto.
3. Criar `ci.yml` — executado em PRs e pushes para branches de feature.
4. Criar `cd.yml` — executado em push para `main` ou tags `v*`.
5. Perguntar ao usuário: registry de destino (GHCR, Docker Hub, ECR)?
6. Perguntar: ambiente de deploy (Fly.io, Railway, ECS, VPS)?
7. Adaptar o `cd.yml` com base nas respostas.

## Perguntas ao usuário (antes de criar cd.yml)

> "Para o pipeline de CD, preciso saber:\n> 1. Registry Docker: GitHub Container Registry (GHCR), Docker Hub, ou AWS ECR?\n> 2. Deploy para: Fly.io, Railway, AWS ECS, VPS (SSH), ou apenas build/push sem deploy automático?"

## References

- Consultar `references/cicd-pattern.md` para templates completos dos workflows.
- Consultar `../skills-standards.md` para convenções globais.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
