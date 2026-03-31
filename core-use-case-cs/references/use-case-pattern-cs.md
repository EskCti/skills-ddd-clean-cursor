# Use Case Pattern (C#)

## Paths

- Contrato base: `Project.Shared.Kernel/Application/IUseCase.cs`
- Use cases (exemplos):
  - `src/Project.Core/Application/UseCases/Product/CreateProductUseCase.cs`
  - `src/Project.Core/Application/UseCases/Auth/LoginUseCase.cs`

## Estrutura esperada

1. Definir `XxxInput` (e `XxxOutput` se necessário).
2. Declarar classe `XxxUseCase : IUseCase<XxxInput, XxxOutput>`.
3. Injetar dependências via construtor (`IRepository`, `IQuery`, `IService`).
4. Implementar `Task<Result<XxxOutput>> Execute(XxxInput input)`.
5. Aplicar validações de fluxo com early return em falha.
6. Delegar invariantes de domínio para entidade/VO (`Create`).
7. Retornar `Result.Success(output)` ou `Result.Failure(errors)`.

## Exemplo mínimo (C#)

```csharp
using Project.Shared.Kernel.Application;
using Project.Shared.Kernel.Results;
using Project.Core.Domain.Entities;
using Project.Core.Domain.Repositories;

namespace Project.Core.Application.UseCases.Product;

public record CreateProductInput(string Name, decimal Price);

public class CreateProductUseCase : IUseCase<CreateProductInput, Guid>
{
    private readonly IProductRepository _repo;

    public CreateProductUseCase(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<Result<Guid>> Execute(CreateProductInput input)
    {
        // 1. Validar domínio via Entidade
        var productResult = Product.Create(input.Name, input.Price);
        if (productResult.IsFailure) return Result.Failure<Guid>(productResult.Errors);

        // 2. Persistir
        var saveResult = await _repo.Save(productResult.Value);
        if (saveResult.IsFailure) return Result.Failure<Guid>(saveResult.Errors);

        return Result.Success(productResult.Value.Id);
    }
}
```

## Estratégia de testes

- Cenário de sucesso completo.
- Falhas de validação de domínio (ex: preço negativo).
- Falhas de dependência (ex: erro no repositório).
- Mocks para interfaces usando `NSubstitute` ou `Moq`.
