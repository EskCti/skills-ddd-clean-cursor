using Xunit;
using Project.Shared.Kernel.Domain.ValueObjects;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Domain.Tests.ValueObjects;

public class ProductNameTests
{
    [Fact]
    public void Create_ValidName_ShouldReturnSuccess()
    {
        var validName = "Laptop Dell XPS 15";
        var result = ProductName.Create(validName);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(validName.Trim(), result.Value.Value);
    }
    
    [Fact]
    public void Create_EmptyName_ShouldReturnFailure()
    {
        var result = ProductName.Create("");
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("cannot be empty", result.Errors[0]);
    }
    
    [Fact]
    public void Create_NameTooShort_ShouldReturnFailure()
    {
        var result = ProductName.Create("ab");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("at least 3 characters", result.Errors[0]);
    }
    
    [Fact]
    public void Create_NameTooLong_ShouldReturnFailure()
    {
        var longName = new string('a', 101);
        var result = ProductName.Create(longName);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot exceed 100 characters", result.Errors[0]);
    }
    
    [Fact]
    public void Create_NameWithInvalidCharacters_ShouldReturnFailure()
    {
        var invalidName = "Product@#$%";
        var result = ProductName.Create(invalidName);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("invalid characters", result.Errors[0]);
    }
    
    [Fact]
    public void Equals_SameValue_ShouldBeEqual()
    {
        var name1 = ProductName.Create("Laptop").Value;
        var name2 = ProductName.Create("Laptop").Value;
        
        Assert.Equal(name1, name2);
    }
    
    [Fact]
    public void Equals_DifferentCase_ShouldBeEqual()
    {
        var name1 = ProductName.Create("Laptop").Value;
        var name2 = ProductName.Create("laptop").Value;
        
        Assert.Equal(name1, name2);
    }
    
    [Fact]
    public void Equals_DifferentValue_ShouldNotBeEqual()
    {
        var name1 = ProductName.Create("Laptop").Value;
        var name2 = ProductName.Create("Desktop").Value;
        
        Assert.NotEqual(name1, name2);
    }
}

public class MoneyTests
{
    [Fact]
    public void Create_ValidMoney_ShouldReturnSuccess()
    {
        var result = Money.Create(99.99m, "USD");
        
        Assert.True(result.IsSuccess);
        Assert.Equal(99.99m, result.Value.Amount);
        Assert.Equal("USD", result.Value.Currency);
    }
    
    [Fact]
    public void Create_NegativeAmount_ShouldReturnFailure()
    {
        var result = Money.Create(-10m, "USD");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be negative", result.Errors[0]);
    }
    
    [Fact]
    public void Create_TooLargeAmount_ShouldReturnFailure()
    {
        var result = Money.Create(2_000_000m, "USD");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot exceed", result.Errors[0]);
    }
    
    [Fact]
    public void Create_InvalidCurrency_ShouldReturnFailure()
    {
        var result = Money.Create(100m, "US");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("3-letter code", result.Errors[0]);
    }
    
    [Fact]
    public void Create_EmptyCurrency_ShouldReturnFailure()
    {
        var result = Money.Create(100m, "");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be empty", result.Errors[0]);
    }
    
    [Fact]
    public void Create_MultipleValidationErrors_ShouldReturnAllErrors()
    {
        var result = Money.Create(-100m, "US");
        
        Assert.False(result.IsSuccess);
        Assert.Equal(2, result.Errors.Count);
        Assert.Contains("cannot be negative", result.Errors[0]);
        Assert.Contains("3-letter code", result.Errors[1]);
    }
    
    [Fact]
    public void Add_SameCurrency_ShouldReturnCorrectSum()
    {
        var money1 = Money.Create(50m, "USD").Value;
        var money2 = Money.Create(30m, "USD").Value;
        
        var result = money1.Add(money2);
        
        Assert.Equal(80m, result.Amount);
        Assert.Equal("USD", result.Currency);
    }
    
    [Fact]
    public void Add_DifferentCurrency_ShouldThrowException()
    {
        var money1 = Money.Create(50m, "USD").Value;
        var money2 = Money.Create(30m, "EUR").Value;
        
        Assert.Throws<InvalidOperationException>(() => money1.Add(money2));
    }
    
    [Fact]
    public void Multiply_ByFactor_ShouldReturnCorrectAmount()
    {
        var money = Money.Create(25m, "USD").Value;
        
        var result = money.Multiply(3);
        
        Assert.Equal(75m, result.Amount);
        Assert.Equal("USD", result.Currency);
    }
    
    [Fact]
    public void Equals_SameAmountAndCurrency_ShouldBeEqual()
    {
        var money1 = Money.Create(100m, "USD").Value;
        var money2 = Money.Create(100m, "USD").Value;
        
        Assert.Equal(money1, money2);
    }
    
    [Fact]
    public void Equals_DifferentAmount_ShouldNotBeEqual()
    {
        var money1 = Money.Create(100m, "USD").Value;
        var money2 = Money.Create(200m, "USD").Value;
        
        Assert.NotEqual(money1, money2);
    }
    
    [Fact]
    public void Equals_DifferentCurrency_ShouldNotBeEqual()
    {
        var money1 = Money.Create(100m, "USD").Value;
        var money2 = Money.Create(100m, "EUR").Value;
        
        Assert.NotEqual(money1, money2);
    }
}

public class ProductDescriptionTests
{
    [Fact]
    public void Create_ValidDescription_ShouldReturnSuccess()
    {
        var validDescription = "This is a valid product description with enough length.";
        var result = ProductDescription.Create(validDescription);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(validDescription.Trim(), result.Value.Value);
    }
    
    [Fact]
    public void Create_TooShortDescription_ShouldReturnFailure()
    {
        var shortDescription = "Too short";
        var result = ProductDescription.Create(shortDescription);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("at least 10 characters", result.Errors[0]);
    }
    
    [Fact]
    public void Create_TooLongDescription_ShouldReturnFailure()
    {
        var longDescription = new string('a', 1001);
        var result = ProductDescription.Create(longDescription);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot exceed 1000 characters", result.Errors[0]);
    }
    
    [Fact]
    public void Create_EmptyDescription_ShouldReturnFailure()
    {
        var result = ProductDescription.Create("");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be empty", result.Errors[0]);
    }
}