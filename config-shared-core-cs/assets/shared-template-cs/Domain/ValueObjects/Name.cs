using Project.Shared.Kernel.Domain.Results;

namespace Project.Shared.Kernel.Domain.ValueObjects;

public record Name
{
    public string Value { get; }

    private Name(string value) => Value = value;

    public static Result<Name> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<Name>.Failure("Name is required");

        if (value.Length < 3)
            return Result<Name>.Failure("Name must be at least 3 characters");

        return Result<Name>.Success(new Name(value.Trim()));
    }

    public static implicit operator string(Name name) => name.Value;
}
