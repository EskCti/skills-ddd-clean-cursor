# config-project-cs — assets

Template de solução .NET 8 com Clean Architecture em **apps/backend/**.

## Conteúdo

- `ProjectName.sln` (raiz do template)
- `apps/backend/ProjectName.Backend/` + `Program.cs`
- `apps/backend/ProjectName.Core/`
- `apps/backend/ProjectName.Infrastructure/`
- `apps/backend/ProjectName.Shared.Kernel/`
- `apps/backend/tests/ProjectName.UnitTests/`
- `apps/backend/tests/ProjectName.IntegrationTests/` — `WebApplicationFactory<Program>`

Gerado por `scripts/project-init-cs.mjs` com substituição de `ProjectName` e opcional `--backend-path`.
