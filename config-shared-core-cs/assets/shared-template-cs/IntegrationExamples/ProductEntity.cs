using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.Results;
using Project.Shared.Kernel.Domain.ValueObjects;

namespace Project.Product.Domain.Entities;

public class Product : Entity
{
    public ProductName Name { get; private set; }
    public ProductDescription Description { get; private set; }
    public Money Price { get; private set; }
    public ProductStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private Product(ProductName name, ProductDescription description, Money price, Guid? id = null)
    {
        Id = id ?? Guid.NewGuid();
        Name = name;
        Description = description;
        Price = price;
        Status = ProductStatus.Active;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<Product> Create(string name, string description, decimal price, string currency = "USD")
    {
        var nameResult = ProductName.Create(name);
        var descriptionResult = ProductDescription.Create(description);
        var priceResult = Money.Create(price, currency);

        var combined = Result<ProductName>.Combine(
            nameResult,
            descriptionResult,
            priceResult);

        if (combined.IsFailure)
            return Result<Product>.Failure(combined.Errors);

        var (validName, validDescription, validPrice) = combined.Value;
        return Result<Product>.Success(new Product(validName, validDescription, validPrice));
    }

    public Result UpdatePrice(decimal newPrice, string currency = "USD")
    {
        var priceResult = Money.Create(newPrice, currency);
        if (priceResult.IsFailure)
            return Result.Failure(priceResult.Errors);

        Price = priceResult.Value;
        UpdatedAt = DateTime.UtcNow;
        
        return Result.Success();
    }

    public Result Activate()
    {
        if (Status == ProductStatus.Active)
            return Result.Failure("Product is already active");

        Status = ProductStatus.Active;
        UpdatedAt = DateTime.UtcNow;
        
        return Result.Success();
    }

    public Result Deactivate()
    {
        if (Status == ProductStatus.Inactive)
            return Result.Failure("Product is already inactive");

        Status = ProductStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;
        
        return Result.Success();
    }
}

public enum ProductStatus
{
    Active,
    Inactive,
    Discontinued
}