# Shared Core Patterns (C#)

## Entidades Base

- `Entity.cs`: Classe abstrata com `Guid Id` e `IReadOnlyCollection<IDomainEvent>`.
- `ValueObject.cs`: Record ou Classe base com suporte a igualdade por valor.

## Results e Erros

- `Result<T>`: Objeto imutável para retorno de sucesso/falha.
- `Error.cs`: Objeto rico com `Code`, `Message` e `Type`.

## Application Base

- `IUseCase<TIn, TOut>`: Interface padrão para casos de uso.
- `IQuery<TIn, TOut>`: Interface para queries de leitura (CQRS).

## Exemplo de Entity Base (C#)

```csharp
public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    public override bool Equals(object? obj)
    {
        if (obj is not Entity other) return false;
        if (ReferenceEquals(this, other)) return true;
        return Id.Equals(other.Id);
    }

    public override int GetHashCode() => Id.GetHashCode();
}
```
