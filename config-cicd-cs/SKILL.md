---
name: config-cicd-cs
stack: csharp
description: Criar ou revisar pipeline GitHub Actions para projetos C# com ASP.NET Core, cobrindo dotnet test, build Docker, push para registry e deploy. Usar quando o pedido envolver GitHub Actions, CI/CD, pipeline, deploy automatizado ou integração contínua para stack C#/ASP.NET Core/.NET 8+.
---

# Config CI/CD (C#)

## Overview

Gerar workflows GitHub Actions para backend C# com ASP.NET Core (.NET 8+), cobrindo CI (dotnet build + test) e CD (build Docker + push + deploy).

## Estrutura gerada

```
project-root/
└── .github/
    └── workflows/
        ├── ci.yml          ← dotnet build + test em PRs
        └── cd.yml          ← build Docker + push + deploy em main/tags
```

## Workflow

1. Verificar se `.github/workflows/` existe; criar se necessário.
2. Criar `ci.yml` — executado em PRs com `dotnet test`.
3. Criar `cd.yml` — executado em push para `main` ou tags `v*`.
4. Perguntar ao usuário: registry (GHCR, Docker Hub, ECR)?
5. Perguntar: ambiente de deploy?

## References

- Consultar `references/cicd-pattern-cs.md` para templates completos.
- Consultar `../skills-standards.md` para convenções globais (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
