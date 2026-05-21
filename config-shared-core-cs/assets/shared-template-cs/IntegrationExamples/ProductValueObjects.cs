using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.Results;
using System.Text.RegularExpressions;

namespace Project.Shared.Kernel.Domain.ValueObjects;

public record ProductName : ValueObject
{
    public string Value { get; }

    private ProductName(string value) => Value = value;

    public static Result<ProductName> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<ProductName>.Failure("Product name cannot be empty");

        if (value.Length < 3)
            return Result<ProductName>.Failure("Product name must be at least 3 characters long");

        if (value.Length > 100)
            return Result<ProductName>.Failure("Product name cannot exceed 100 characters");

        // Validar caracteres permitidos
        if (!Regex.IsMatch(value, @"^[a-zA-Z0-9\s\-_.,!?()]+$"))
            return Result<ProductName>.Failure("Product name contains invalid characters");

        return Result<ProductName>.Success(new ProductName(value.Trim()));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value.ToLowerInvariant();
    }
}

public record ProductDescription : ValueObject
{
    public string Value { get; }

    private ProductDescription(string value) => Value = value;

    public static Result<ProductDescription> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result<ProductDescription>.Failure("Product description cannot be empty");

        if (value.Length < 10)
            return Result<ProductDescription>.Failure("Product description must be at least 10 characters long");

        if (value.Length > 1000)
            return Result<ProductDescription>.Failure("Product description cannot exceed 1000 characters");

        return Result<ProductDescription>.Success(new ProductDescription(value.Trim()));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

public record Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Result<Money> Create(decimal amount, string currency = "USD")
    {
        var errors = new List<string>();

        if (amount < 0)
            errors.Add("Amount cannot be negative");

        if (amount > 1_000_000)
            errors.Add("Amount cannot exceed 1,000,000");

        if (string.IsNullOrWhiteSpace(currency))
            errors.Add("Currency cannot be empty");

        if (currency.Length != 3)
            errors.Add("Currency must be a 3-letter code (e.g., USD, EUR, BRL)");

        if (errors.Any())
            return Result<Money>.Failure(errors);

        return Result<Money>.Success(new Money(amount, currency.ToUpperInvariant()));
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot add money with different currencies");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Multiply(decimal factor)
    {
        return new Money(Amount * factor, Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}