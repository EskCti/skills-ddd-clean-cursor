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
6. Códigos de erro estáticos (ex.: `Error.InvalidEmail`) para mensagens reutilizáveis.

## Exemplo mínimo (C#)

```csharp
using Project.Shared.Kernel.Domain.Results;

namespace Project.Core.Domain.ValueObjects;

public record Email
{
    public static class Error
    {
        public const string Required = "Email is required";
        public const string Invalid = "Invalid email format";
    }

    private Email(string value) => Value = value;

    public string Value { get; init; }

    public static Result<Email> Create(string email)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(email))
            errors.Add(Error.Required);

        if (!string.IsNullOrWhiteSpace(email) && !email.Contains("@"))
            errors.Add(Error.Invalid);

        if (errors.Count > 0)
            return Result<Email>.Failure(errors);

        return Result<Email>.Success(new Email(email.Trim().ToLower()));
    }

    public static implicit operator string(Email email) => email.Value;
}
```

## Estratégia de testes

- Validação de entrada (nulo, vazio, formato).
- Acumulação: entrada com múltiplas violações retorna todas em `Errors` (nunca só a primeira).
- Garantia de normalização (ex.: lowercase).
- Verificação de igualdade estrutural (nativa no `record`).