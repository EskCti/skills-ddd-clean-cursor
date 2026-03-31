# Project Template (C#)

This folder contains the base solution and project files for a new .NET Clean Architecture project:

- `ProjectName.sln`
- `src/ProjectName.Backend/ProjectName.Backend.csproj` + `Program.cs`
- `src/ProjectName.Core/ProjectName.Core.csproj`
- `src/ProjectName.Infrastructure/ProjectName.Infrastructure.csproj`
- `src/ProjectName.Shared.Kernel/ProjectName.Shared.Kernel.csproj`

The `project-init-cs.mjs` script copies these templates, replaces `ProjectName` with the actual project name, and runs `dotnet restore`.
