using Xunit;
using Project.Product.Domain.Entities;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Domain.Tests.Entities;

public class ProductTests
{
    [Fact]
    public void Create_ValidProduct_ShouldReturnSuccess()
    {
        var name = "Laptop Dell XPS 15";
        var description = "High-performance laptop with 16GB RAM and 512GB SSD";
        var price = 1499.99m;
        
        var result = Product.Create(name, description, price, "USD");
        
        Assert.True(result.IsSuccess);
        Assert.Equal(name.Trim(), result.Value.Name.Value);
        Assert.Equal(description.Trim(), result.Value.Description.Value);
        Assert.Equal(price, result.Value.Price.Amount);
        Assert.Equal("USD", result.Value.Price.Currency);
        Assert.Equal(ProductStatus.Active, result.Value.Status);
        Assert.NotEqual(Guid.Empty, result.Value.Id);
        Assert.True(result.Value.CreatedAt <= DateTime.UtcNow);
    }
    
    [Fact]
    public void Create_InvalidName_ShouldReturnFailure()
    {
        var result = Product.Create("", "Valid description", 100m);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be empty", result.Errors[0]);
    }
    
    [Fact]
    public void Create_InvalidDescription_ShouldReturnFailure()
    {
        var result = Product.Create("Valid name", "Too short", 100m);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("at least 10 characters", result.Errors[0]);
    }
    
    [Fact]
    public void Create_InvalidPrice_ShouldReturnFailure()
    {
        var result = Product.Create("Valid name", "Valid description", -100m);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be negative", result.Errors[0]);
    }
    
    [Fact]
    public void Create_MultipleValidationErrors_ShouldReturnAllErrors()
    {
        var result = Product.Create("", "Short", -100m);
        
        Assert.False(result.IsSuccess);
        Assert.True(result.Errors.Count >= 3);
    }
    
    [Fact]
    public void UpdatePrice_ValidPrice_ShouldReturnSuccess()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        var originalUpdatedAt = product.UpdatedAt;
        
        var result = product.UpdatePrice(1200m, "USD");
        
        Assert.True(result.IsSuccess);
        Assert.Equal(1200m, product.Price.Amount);
        Assert.NotNull(product.UpdatedAt);
        Assert.NotEqual(originalUpdatedAt, product.UpdatedAt);
    }
    
    [Fact]
    public void UpdatePrice_InvalidPrice_ShouldReturnFailure()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        var originalPrice = product.Price;
        
        var result = product.UpdatePrice(-100m);
        
        Assert.False(result.IsSuccess);
        Assert.Equal(originalPrice, product.Price);
        Assert.Null(product.UpdatedAt);
    }
    
    [Fact]
    public void Activate_ActiveProduct_ShouldReturnFailure()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        
        var result = product.Activate();
        
        Assert.False(result.IsSuccess);
        Assert.Contains("already active", result.Errors[0]);
    }
    
    [Fact]
    public void Activate_InactiveProduct_ShouldReturnSuccess()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        product.Deactivate();
        var originalUpdatedAt = product.UpdatedAt;
        
        var result = product.Activate();
        
        Assert.True(result.IsSuccess);
        Assert.Equal(ProductStatus.Active, product.Status);
        Assert.NotNull(product.UpdatedAt);
        Assert.NotEqual(originalUpdatedAt, product.UpdatedAt);
    }
    
    [Fact]
    public void Deactivate_ActiveProduct_ShouldReturnSuccess()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        var originalUpdatedAt = product.UpdatedAt;
        
        var result = product.Deactivate();
        
        Assert.True(result.IsSuccess);
        Assert.Equal(ProductStatus.Inactive, product.Status);
        Assert.NotNull(product.UpdatedAt);
        Assert.NotEqual(originalUpdatedAt, product.UpdatedAt);
    }
    
    [Fact]
    public void Deactivate_InactiveProduct_ShouldReturnFailure()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        product.Deactivate();
        var originalUpdatedAt = product.UpdatedAt;
        
        var result = product.Deactivate();
        
        Assert.False(result.IsSuccess);
        Assert.Contains("already inactive", result.Errors[0]);
        Assert.Equal(originalUpdatedAt, product.UpdatedAt);
    }
    
    [Fact]
    public void Equals_SameId_ShouldBeEqual()
    {
        var id = Guid.NewGuid();
        var product1 = Product.Create("Product 1", "Description 1", 100m, id).Value;
        var product2 = Product.Create("Product 2", "Description 2", 200m, id).Value;
        
        Assert.Equal(product1, product2);
        Assert.Equal(product1.GetHashCode(), product2.GetHashCode());
    }
    
    [Fact]
    public void Equals_DifferentId_ShouldNotBeEqual()
    {
        var product1 = Product.Create("Product", "Description", 100m).Value;
        var product2 = Product.Create("Product", "Description", 100m).Value;
        
        Assert.NotEqual(product1, product2);
        Assert.NotEqual(product1.GetHashCode(), product2.GetHashCode());
    }
    
    [Fact]
    public void EntityBase_EqualityOperators_ShouldWorkCorrectly()
    {
        var id = Guid.NewGuid();
        var product1 = Product.Create("Product", "Description", 100m, id).Value;
        var product2 = Product.Create("Product", "Description", 100m, id).Value;
        var product3 = Product.Create("Different", "Description", 100m).Value;
        
        Assert.True(product1 == product2);
        Assert.False(product1 != product2);
        Assert.False(product1 == product3);
        Assert.True(product1 != product3);
        
        // Test null comparisons
        Assert.False(product1 == null);
        Assert.True(product1 != null);
        Assert.False(null == product1);
        Assert.True(null != product1);
    }
}