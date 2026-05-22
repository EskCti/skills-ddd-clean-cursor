# Entity Pattern (C#)

## Paths

- `apps/backend/Project.Core/Domain/Entities/*.cs`

## Estrutura esperada

- Classe ou Record (se imutável).
- Construtor privado/protegido.
- Método estático `Create` retornando `Result<T>`.
- Identificador `Id` (Guid).
- Validação de invariantes no `Create`.

## Exemplo em C#

```csharp
public class Customer : Entity
{
    public string Name { get; private set; }
    public string Email { get; private set; }

    private Customer(string name, string email, Guid? id = null)
    {
        Id = id ?? Guid.NewGuid();
        Name = name;
        Email = email;
    }

    public static Result<Customer> Create(string name, string email)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Customer>("Name is required");

        if (!email.Contains("@"))
            return Result.Failure<Customer>("Invalid email");

        return Result.Success(new Customer(name, email));
    }
}
```

## Checklist

- [ ] Herda de `Entity` do Shared Kernel.
- [ ] Construtor não é público.
- [ ] Factory method `Create` contém as validações.
- [ ] Propriedades têm `private set`.
- [ ] Testes unitários cobrem cenários de erro de validação.
