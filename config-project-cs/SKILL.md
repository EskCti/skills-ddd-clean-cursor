---
name: config-project-cs
stack: csharp
description: "Inicializar ou continuar um projeto C# com ASP.NET Core e estrutura de solução (.sln) multi-projeto, seguindo os padrões de Clean Architecture. Usar quando o pedido envolver bootstrap de projeto .NET, setup inicial de solução e projetos, ou padronização da estrutura C#."
---

# Config Project (C#)

## Overview

Executar setup determinístico e idempotente para bootstrap de projeto C# (.NET), organizado em solução (.sln) com múltiplos projetos (.csproj) para suportar Clean Architecture.

## Estrutura alvo

```
project-root/
├── ProjectName.sln                # Solução global
├── docker-compose.yml
├── .env / .env.example
├── .gitignore
├── src/
│   ├── ProjectName.Backend/       # ASP.NET Core API
│   │   ├── ProjectName.Backend.csproj
│   │   └── Program.cs
│   ├── ProjectName.Core/          # Domínio e Aplicação
│   │   └── ProjectName.Core.csproj
│   ├── ProjectName.Infrastructure/# Persistência e Infra
│   │   └── ProjectName.Infrastructure.csproj
│   └── ProjectName.Shared.Kernel/ # Kernel compartilhado
│       └── ProjectName.Shared.Kernel.csproj
└── tests/
    ├── ProjectName.UnitTests/        ← xUnit + Moq + Coverlet (≥95% domain/app)
    └── ProjectName.IntegrationTests/ ← WebApplicationFactory — E2E API
```

## Workflow

1. Detectar se já existe arquivo `.sln` no diretório atual.
2. Se ausente, inicializar solução com `dotnet new sln`.
3. Criar projetos usando templates `webapi` (Backend) e `classlib` (Core, Infrastructure, Shared).
4. Adicionar projetos à solução: `dotnet sln add <path-to-csproj>`.
5. Configurar referências entre projetos (Core -> Shared, Infrastructure -> Core, Backend -> Infrastructure/Core).
6. Configurar o `Program.cs` no Backend com:
   - Middlewares padrão (Swagger, CORS, etc.).
   - Injeção de dependências das outras camadas.
7. Configurar `.env`, `.env.example`, `.gitignore` e `docker-compose.yml`.
8. Validar build e testes: `dotnet build` && `dotnet test`.

## Commands

Fluxo padrão:

```bash
node config-project-cs/scripts/project-init-cs.mjs
```

## Resources

- `agents/openai.yaml`: Configuração do agente.
- `scripts/project-init-cs.mjs`: Script de bootstrap (placeholder).
- `assets/project-template-cs/`: Template completo da solução (.sln, .csproj, Program.cs).
- `references/bootstrap-contract-cs.md`: Detalhes da estrutura gerada.

## Global Standards

- Consultar `../skills-standards.md` para padrões globais de nomenclatura e convenções gerais entre skills.
