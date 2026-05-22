---
name: config-docker-cs
stack: csharp
description: Criar ou revisar Dockerfile multi-stage para produção em projetos C# com ASP.NET Core, gerando imagem .NET otimizada com SDK build e ASP.NET runtime enxuto. Usar quando o pedido envolver Dockerfile, imagem Docker, build de produção, containerização ou docker-compose de produção para stack C#/ASP.NET Core/.NET 8+.
---

# Config Docker (C#)

## Overview

Gerar Dockerfile multi-stage otimizado para produção em backend C# com ASP.NET Core (.NET 8+).

> O `docker-compose.yml` de **desenvolvimento local** (apenas banco) é gerado pelo `config-efcore-cs`. Este skill cobre **build de produção** com multi-stage e imagem runtime enxuta.

## Estrutura gerada

```
project-root/
├── src/
│   └── ProjectName.Backend/
│       └── Dockerfile          ← multi-stage SDK + ASP.NET runtime
├── docker-compose.prod.yml     ← orquestra backend + db
└── .dockerignore               ← exclui bin, obj, .env
```

## Workflow

1. Verificar se `ProjectName.sln` e `apps/backend/ProjectName.Backend/` existem.
2. Criar `apps/backend/ProjectName.Backend/Dockerfile` com estágio `builder` (dotnet publish) e `runner` (aspnet runtime).
3. Criar `.dockerignore` cobrindo `bin/`, `obj/`, `.env*`.
4. Criar `docker-compose.prod.yml` orquestrando backend e postgres.
5. Validar: `docker build -f apps/backend/ProjectName.Backend/Dockerfile .`

## References

- Consultar `references/docker-pattern-cs.md` para templates completos.
- Consultar `../skills-standards.md` para convenções globais (seção C#).

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
