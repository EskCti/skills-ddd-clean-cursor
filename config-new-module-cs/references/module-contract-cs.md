# New Module Contract (C#)

## Estrutura Gerada no `src/`

Para um novo módulo `<ModuleName>`:

- `src/Project.<ModuleName>/Project.<ModuleName>.csproj`
  - Referências: `Project.Shared.Kernel`
- `src/Project.<ModuleName>/Domain/Entities/<ModuleName>.cs`
- `src/Project.<ModuleName>/Domain/Repositories/I<ModuleName>Repository.cs`
- `src/Project.<ModuleName>/Application/UseCases/` — gerar via `core-use-case-cs` (IUseCase, `Result<T>`, `Errors` §5.1)
- `src/Project.<ModuleName>/Application/DTOs/` — gerar via `core-dto-cs` (records In/Out/Query)

## Integração com a Solução

- [ ] Executar `dotnet sln add src/Project.<ModuleName>/Project.<ModuleName>.csproj`.
- [ ] Adicionar referência no Projeto de Backend: `dotnet add src/Project.Backend/Project.Backend.csproj reference src/Project.<ModuleName>/Project.<ModuleName>.csproj`.
- [ ] Registrar serviços do módulo no `Program.cs` ou via extensão `IServiceCollection`.

## Convenções de Código

- Namespace: `Project.<ModuleName>.<Layer>` (ex: `Project.Ordering.Domain.Entities`).
- Nomenclatura PascalCase em arquivos e classes.
- Contrato do `csproj` deve seguir a versão do .NET do root.
- Exemplo mínimo de use case + DTO (para que o scaffold não deixe pastas vazias):

```csharp
public sealed record Create<ModuleName>Input(string Name);

public sealed record Create<ModuleName>Output(Guid Id, string Name;

public sealed class Create<ModuleName>UseCase(
    I<ModuleName>Repository repository)
 : IUseCase<Create<ModuleName>Input, Create<ModuleName>Output>
{
    public async Task<Result<Create<ModuleName>Output>> ExecuteAsync(
        Create<ModuleName>Input input, CancellationToken ct = default)
    {
        var entityResult = <ModuleName>.Create(Name.Create(input.Name).Value);
        if (!entityResult.IsSuccess)
            return Result<Create<ModuleName>Output>.Failure(entityResult.Errors;

        await repository.SaveAsync(entityResult.Value, ct);
        return Result<Create<ModuleName>Output>.Success(
            new Create<ModuleName>Output(entityResult.Value.Id, entityResult.Value.Name.Value));
    }
}
```
