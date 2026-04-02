# DTO Pattern (C#)

## Definição

DTOs (Data Transfer Objects) são objetos puros usados para transitar dados entre camadas, especialmente entre a API e a Camada de Aplicação.

## Padrão em C# (Records)

No .NET 8+, preferimos o uso de `record` para DTOs devido à imutabilidade nativa e sintaxe concisa.

## Convenções

- **Input DTOs**: Recebem dados da Request. Ex: `CreateUserRequest`.
- **Output DTOs**: Retornam dados para a Response. Ex: `UserResponse`.
- **Application DTOs**: Transitados entre Use Case e Infra. Ex: `UserDto`.

## Exemplo em C#

```csharp
namespace Project.Core.Application.DTOs;

public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price
);

public record ProductResponse(
    Guid Id,
    string Name,
    decimal Price,
    DateTime CreatedAt
);
```

## Mapping

- Use construtores ou métodos de extensão para mapear de Entidade para DTO.
- Evite lógica complexa dentro do DTO.
- Mantenha propriedades com `init` ou apenas `get` (imutáveis).
