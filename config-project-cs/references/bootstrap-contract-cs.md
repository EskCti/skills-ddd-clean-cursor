# C# Project Bootstrap Contract

## Goal

Padronizar o bootstrap de uma solução .NET (C#) com Clean Architecture em **monorepo full-stack**:

- `apps/backend/<Project>.Backend` (ASP.NET Core API — ou `<Project>.Api`)
- `apps/backend/<Project>.Core`
- `apps/backend/<Project>.Infrastructure`
- `apps/backend/<Project>.Shared.Kernel`
- `apps/backend/tests/<Project>.UnitTests` e `<Project>.IntegrationTests`

`<Project>.sln` permanece na **raiz** do repositório.

Alinhado a `skills.config.json` (`backendAppPath: apps/backend`) e ao **Config Project Full-Stack** (mesmo padrão de `apps/backend-kt` no Kotlin).

## Steps Applied

1. Inicializar solução (`dotnet new sln` ou template `ProjectName.sln`).
2. Criar projetos sob `apps/backend/`:
   - `*.Backend` (Template: `webapi`)
   - `*.Core`, `*.Infrastructure`, `*.Shared.Kernel` (Template: `classlib`)
3. Criar testes em `apps/backend/tests/`.
4. Configurar referências:
   - `Backend` → `Infrastructure`, `Core`
   - `Infrastructure` → `Core`
   - `Core` → `Shared.Kernel`
5. Configurar `.csproj` global (`net8.0`, nullable, implicit usings).
6. Setup de `Program.cs` no Backend (Swagger, CORS, DI).
7. `.gitignore`, `.env.example`, `docker-compose.yml` na raiz.
8. Expor `public partial class Program { }` no Backend para integration tests.
9. Validar: `dotnet build` && `dotnet test`.

## Dependência entre projetos

Projetos irmãos em `apps/backend/` — referências relativas `..\Project.Core\`:

- `apps/backend/Project.Backend/Project.Backend.csproj`:
  ```xml
  <ItemGroup>
    <ProjectReference Include="..\Project.Infrastructure\Project.Infrastructure.csproj" />
    <ProjectReference Include="..\Project.Core\Project.Core.csproj" />
  </ItemGroup>
  ```
- `apps/backend/tests/Project.IntegrationTests/`:
  ```xml
  <ProjectReference Include="..\..\Project.Backend\Project.Backend.csproj" />
  ```

## Script

```bash
node config-project-cs/scripts/project-init-cs.mjs --project-name=RetailOps --backend-path=apps/backend
```

## Notes

- Setup idempotente: pula arquivos existentes.
- Frontends e mobile ficam em `apps/web-*`, `apps/mobile-*` — não em `src/`.
- Módulos por BC futuros: `apps/backend/Project.<ModuleName>/` ou projetos adicionais na mesma solução (ver `config-new-module-cs`).
- Override de pasta: `--backend-path=apps/api` se o time padronizar outro nome (mantendo sob `apps/`).
