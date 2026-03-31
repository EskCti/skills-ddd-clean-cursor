using Project.Shared.Kernel.Domain.Results;

namespace Project.Shared.Kernel.Domain.ValueObjects;

public record Id
{
    public Guid Value { get; }

    private Id(Guid value) => Value = value;

    public static Result<Id> Create(Guid value)
    {
        if (value == Guid.Empty)
            return Result<Id>.Failure("Id cannot be empty");

        return Result<Id>.Success(new Id(value));
    }

    public static Result<Id> New() => Result<Id>.Success(new Id(Guid.NewGuid()));

    public static implicit operator Guid(Id id) => id.Value;
}
