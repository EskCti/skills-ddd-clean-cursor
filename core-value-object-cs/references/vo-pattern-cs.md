# Value Object Pattern (C#)

## Paths

- Base value object: `Project.Shared.Kernel/Domain/Base/ValueObject.cs`
- Value Objects (exemplos):
  - `Project.Core/Domain/ValueObjects/Email.cs`
  - `Project.Core/Domain/ValueObjects/Name.cs`

## Estrutura esperada

1. Declarar record `Xxx(Type Value)`.
2. Construtor `private/protected`.
3. Método estático `Create(Type value)` retornando `Result<Xxx>`.
4. Validação de invariantes no `Create`.
5. Acumular regras violadas em `List<string>` e `Result.Failure(errors)`; nunca só a primeira mensagem quando houver várias.

## Exemplo mínimo (C#)

```csharp
using Project.Shared.Kernel.Domain;
using Project.Shared.Kernel.Results;

namespace Project.Core.Domain.ValueObjects;

public record Email
{
    private Email(string value) => Value = value;

    public string Value { get; init; }

    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Email>("Email is required");

        if (!email.Contains("@"))
            return Result.Failure<Email>("Invalid email format");

        return Result.Success(new Email(email.ToLower().Trim()));
    }

    public static implicit operator string(Email email) => email.Value;
}
```

## Estratégia de testes

- Validação de entrada (nulo, vazio, formato).
- Garantia de normalização (ex.: lowercase).
- Verificação de igualdade estrutural (nativa no `record`).
