# Entity Pattern (C#)

## Paths

- `src/Project.Core/Domain/Entities/*.cs`

## Estrutura esperada

- Classe ou Record (se imutável).
- Construtor privado/protegido.
- Método estático `Create` retornando `Result<T>`.
- Identificador `Id` (Guid).
- Validar invariantes no `Create` e **combinar erros de VOs** (`Result<T>.Combine`).

## Exemplo com lista de erros

```csharp
public static Result<Customer> Create(string name, string email)
{
    var nameResult = Name.Create(name);
    var emailResult = Email.Create(email);

    var combined = Result<Name>.Combine(nameResult, emailResult);
    if (combined.IsFailure)
        return Result<Customer>.Failure(combined.Errors);

    return Result<Customer>.Success(
        new Customer(combined.Value.Item1, combined.Value.Item2));
}
```

## Checklist

- [ ] Herda de `Entity` do Shared Kernel.
- [ ] Construtor não é público.
- [ ] Factory `Create` agrega `Errors` de todos os VOs (não retorna no primeiro falho).
- [ ] Propriedades têm `private set`.
- [ ] Testes cobrem `Create_MultipleValidationErrors_ShouldReturnAllErrors`.
