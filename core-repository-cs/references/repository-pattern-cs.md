# Repository Pattern (C#)

## Definição

O Repositório abstrai a persistência de dados, tratando a coleção de entidades como se estivessem em memória. Focado em **Escrita** (Salvar, Deletar) e **Leitura por ID** (para preservar invariantes).

## Estrutura

- **Interface**: Definida no `Core/Domain/Repositories/`.
- **Implementação**: Definida no `Infrastructure/Persistence/Repositories/`.

## Exemplo em C#

```csharp
namespace Project.Core.Domain.Repositories;

public interface IProductRepository
{
    Task<Result<Product?>> GetById(Guid id);
    Task<Result> Save(Product product);
    Task<Result> Delete(Guid id);
}
```

## Checklist

- [ ] Interface depende apenas de Entidades/VOs do Domínio.
- [ ] Métodos assíncronos (`Task`).
- [ ] Implementação isolada na camada de Infraestrutura.
- [ ] Não vazar tipos de frameworks (ex: `IQueryable`) para o Core.
- [ ] Usar o `Result pattern` para indicar falhas técnicas ou de negócio na persistência.
