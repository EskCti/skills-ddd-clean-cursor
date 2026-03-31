using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Shared.Kernel.Domain.ValueObjects;

public record Email
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<Email>.Failure("Email is required");

        if (!value.Contains("@"))
            return Result<Email>.Failure("Invalid email format");

        return Result<Email>.Success(new Email(value.Trim().ToLower()));
    }

    public static implicit operator string(Email email) => email.Value;
}
