---
name: config-project-cs
stack: csharp
description: "Inicializar ou continuar um projeto C# com ASP.NET Core e estrutura de solução (.sln) multi-projeto em apps/backend, seguindo Clean Architecture e monorepo full-stack. Usar quando o pedido envolver bootstrap de projeto .NET, setup inicial de solução e projetos, ou padronização da estrutura C#."
---

# Config Project (C#)

## Overview

Executar setup determinístico e idempotente para bootstrap de projeto C# (.NET) em **monorepo full-stack**: solução `.sln` na raiz e projetos em `apps/backend/` (padrão `skills.config.json` → `backendAppPath`).

> Em bootstrap orquestrado por **Config Project Full-Stack**, este skill roda **antes** de Vue/Angular/Android. Não use `src/` na raiz para a API — alinhe com `apps/web-vue`, `apps/mobile-android`, etc.

## Estrutura alvo

```
project-root/
├── ProjectName.sln
├── docker-compose.yml
├── .env / .env.example
├── apps/
│   ├── backend/
│   │   ├── ProjectName.Backend/       # ASP.NET Core API (ou ProjectName.Api)
│   │   ├── ProjectName.Core/
│   │   ├── ProjectName.Infrastructure/
│   │   ├── ProjectName.Shared.Kernel/
│   │   └── tests/
│   │       ├── ProjectName.UnitTests/
│   │       └── ProjectName.IntegrationTests/
│   ├── web-vue/                       # ou web-angular, web — outro skill
│   └── mobile-android/                # opcional — Config Project (Android)
```

## Workflow

1. Detectar se já existe `.sln` no diretório atual.
2. Executar `project-init-cs.mjs` (template + `--backend-path`, default `apps/backend`).
3. Validar referências entre projetos (Core → Shared.Kernel; Infrastructure → Core; Backend → Infrastructure/Core).
4. Configurar `Program.cs` no Backend (Swagger, CORS para `localhost:5173` / `3000`, DI).
5. Configurar `.env`, `.gitignore`, `docker-compose.yml`.
6. Validar: `dotnet build` && `dotnet test`.

## Commands

```bash
node .agents/skills/config-project-cs/scripts/project-init-cs.mjs --project-name=RetailOps
node .agents/skills/config-project-cs/scripts/project-init-cs.mjs --project-name=RetailOps --backend-path=apps/backend
```

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/project-init-cs.mjs`: Bootstrap idempotente.
- `assets/project-template-cs/`: Template (.sln, projetos em `apps/backend/`).
- `references/bootstrap-contract-cs.md`: Contrato detalhado.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
