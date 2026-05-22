# New Module Contract (C#)

## Estrutura gerada em `apps/backend/`

Para um novo módulo `<ModuleName>`:

- `apps/backend/Project.<ModuleName>/Project.<ModuleName>.csproj`
  - Referências: `Project.Shared.Kernel` (ou `Project.Core` conforme BC)
- `apps/backend/Project.<ModuleName>/Domain/Entities/<ModuleName>.cs`
- `apps/backend/Project.<ModuleName>/Domain/Repositories/I<ModuleName>Repository.cs`
- `apps/backend/Project.<ModuleName>/Application/UseCases/`
- `apps/backend/Project.<ModuleName>/Application/DTOs/`

## Integração com a solução

- [ ] `dotnet sln add apps/backend/Project.<ModuleName>/Project.<ModuleName>.csproj`
- [ ] `dotnet add apps/backend/Project.Backend/Project.Backend.csproj reference apps/backend/Project.<ModuleName>/Project.<ModuleName>.csproj`
- [ ] Registrar serviços no `Program.cs` ou extensão `IServiceCollection`

## Convenções

- Namespace: `Project.<ModuleName>.<Layer>`
- PascalCase em arquivos e classes
- `.csproj` alinhado ao `net8.0` da solução raiz
