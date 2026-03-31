# Query Pattern / CQRS (C#)

## Objetivo

Separar as operações de leitura (Queries) das operações de escrita (Commands/Use Cases), permitindo otimização de performance e modelos de dados simplificados para a UI.

## Estrutura

- **Interface**: `IQuery<TIn, TOut>` no `Core`.
- **Implementação**: No `Infrastructure`, acessando diretamente o banco via Dapper ou EF Core `AsNoTracking()`.
- **Retorno**: DTOs de leitura, nunca Entidades de domínio.

## Exemplo em C#

```csharp
namespace Project.Core.Application.Queries;

public record ListProductsQueryIn(int Page, int PageSize);

public interface IListProductsQuery
{
    Task<Result<PagedList<ProductResponse>>> Execute(ListProductsQueryIn input);
}

// Implementação na Infra
public class ListProductsQuery : IListProductsQuery
{
    private readonly AppDbContext _context;
    public ListProductsQuery(AppDbContext context) => _context = context;

    public async Task<Result<PagedList<ProductResponse>>> Execute(ListProductsQueryIn input)
    {
        var items = await _context.Products
            .AsNoTracking()
            .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.CreatedAt))
            .Skip((input.Page - 1) * input.PageSize)
            .Take(input.PageSize)
            .ToListAsync();

        return Result.Success(new PagedList<ProductResponse>(items, ...));
    }
}
```

## Checklist

- [ ] Interface definida no `Core`.
- [ ] Implementação na `Infrastructure`.
- [ ] Uso de `.AsNoTracking()` no EF Core.
- [ ] Projeção direta para DTO (`Select`).
- [ ] Paginação e filtros suportados.
