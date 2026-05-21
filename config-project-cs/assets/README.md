# Project Template (C#)

This folder contains the base solution and project files for a new .NET Clean Architecture project:

- `ProjectName.sln`
- `src/ProjectName.Backend/ProjectName.Backend.csproj` + `Program.cs`
- `src/ProjectName.Core/ProjectName.Core.csproj`
- `src/ProjectName.Infrastructure/ProjectName.Infrastructure.csproj`
- `src/ProjectName.Shared.Kernel/ProjectName.Shared.Kernel.csproj`
- `tests/ProjectName.UnitTests/` — xUnit + Moq + Coverlet (≥95% domain+application)
- `tests/ProjectName.IntegrationTests/` — `WebApplicationFactory<Program>` (E2E API)

The `project-init-cs.mjs` script copies these templates, replaces `ProjectName` with the actual project name, and runs `dotnet restore`.

After bootstrap, run:

```bash
dotnet test
dotnet test --collect:"XPlat Code Coverage"   # Coverlet → gate ≥95% no CI
```
