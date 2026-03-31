# New Module Contract (C#)

## Estrutura Gerada no `src/`

Para um novo módulo `<ModuleName>`:

- `src/Project.<ModuleName>/Project.<ModuleName>.csproj`
  - Referências: `Project.Shared.Kernel`
- `src/Project.<ModuleName>/Domain/Entities/<ModuleName>.cs`
- `src/Project.<ModuleName>/Domain/Repositories/I<ModuleName>Repository.cs`
- `src/Project.<ModuleName>/Application/UseCases/` (Pasta vazia ou placeholder)
- `src/Project.<ModuleName>/Application/DTOs/` (Pasta vazia ou placeholder)

## Integração com a Solução

- [ ] Executar `dotnet sln add src/Project.<ModuleName>/Project.<ModuleName>.csproj`.
- [ ] Adicionar referência no Projeto de Backend: `dotnet add src/Project.Backend/Project.Backend.csproj reference src/Project.<ModuleName>/Project.<ModuleName>.csproj`.
- [ ] Registrar serviços do módulo no `Program.cs` ou via extensão `IServiceCollection`.

## Convenções de Código

- Namespace: `Project.<ModuleName>.<Layer>` (ex: `Project.Ordering.Domain.Entities`).
- Nomenclatura PascalCase em arquivos e classes.
- Contrato do `csproj` deve seguir a versão do .NET do root.
