using Xunit;
using Project.Product.Domain.Entities;
using Project.Product.Domain.Repositories;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Infrastructure.Tests.Repositories;

public class InMemoryProductRepositoryTests
{
    private readonly InMemoryProductRepository _repository;
    
    public InMemoryProductRepositoryTests()
    {
        _repository = new InMemoryProductRepository();
    }
    
    [Fact]
    public async Task SaveAsync_ValidProduct_ShouldReturnSuccess()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        
        var result = await _repository.SaveAsync(product);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(product, result.Value);
    }
    
    [Fact]
    public async Task GetByIdAsync_ExistingProduct_ShouldReturnProduct()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        await _repository.SaveAsync(product);
        
        var result = await _repository.GetByIdAsync(product.Id);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(product, result.Value);
    }
    
    [Fact]
    public async Task GetByIdAsync_NonExistingProduct_ShouldReturnFailure()
    {
        var nonExistingId = Guid.NewGuid();
        
        var result = await _repository.GetByIdAsync(nonExistingId);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("not found", result.Errors[0]);
    }
    
    [Fact]
    public async Task GetAllAsync_WithProducts_ShouldReturnAllProducts()
    {
        var product1 = Product.Create("Laptop 1", "Description 1", 1000m).Value;
        var product2 = Product.Create("Laptop 2", "Description 2", 2000m).Value;
        
        await _repository.SaveAsync(product1);
        await _repository.SaveAsync(product2);
        
        var result = await _repository.GetAllAsync();
        
        Assert.True(result.IsSuccess);
        var products = result.Value.ToList();
        Assert.Equal(2, products.Count);
        Assert.Contains(product1, products);
        Assert.Contains(product2, products);
    }
    
    [Fact]
    public async Task GetAllAsync_EmptyRepository_ShouldReturnEmptyList()
    {
        var result = await _repository.GetAllAsync();
        
        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value);
    }
    
    [Fact]
    public async Task GetActiveProductsAsync_WithMixedStatus_ShouldReturnOnlyActive()
    {
        var activeProduct = Product.Create("Active Laptop", "Description", 1000m).Value;
        var inactiveProduct = Product.Create("Inactive Laptop", "Description", 2000m).Value;
        inactiveProduct.Deactivate();
        
        await _repository.SaveAsync(activeProduct);
        await _repository.SaveAsync(inactiveProduct);
        
        var result = await _repository.GetActiveProductsAsync();
        
        Assert.True(result.IsSuccess);
        var activeProducts = result.Value.ToList();
        Assert.Single(activeProducts);
        Assert.Equal(activeProduct, activeProducts[0]);
    }
    
    [Fact]
    public async Task DeleteAsync_ExistingProduct_ShouldReturnSuccess()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        await _repository.SaveAsync(product);
        
        var deleteResult = await _repository.DeleteAsync(product.Id);
        var getResult = await _repository.GetByIdAsync(product.Id);
        
        Assert.True(deleteResult.IsSuccess);
        Assert.False(getResult.IsSuccess);
    }
    
    [Fact]
    public async Task DeleteAsync_NonExistingProduct_ShouldReturnFailure()
    {
        var nonExistingId = Guid.NewGuid();
        
        var result = await _repository.DeleteAsync(nonExistingId);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("not found", result.Errors[0]);
    }
    
    [Fact]
    public async Task ExistsAsync_ExistingProduct_ShouldReturnTrue()
    {
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        await _repository.SaveAsync(product);
        
        var result = await _repository.ExistsAsync(product.Id);
        
        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
    }
    
    [Fact]
    public async Task ExistsAsync_NonExistingProduct_ShouldReturnFalse()
    {
        var nonExistingId = Guid.NewGuid();
        
        var result = await _repository.ExistsAsync(nonExistingId);
        
        Assert.True(result.IsSuccess);
        Assert.False(result.Value);
    }
    
    [Fact]
    public async Task SaveAsync_UpdateExistingProduct_ShouldUpdateCorrectly()
    {
        var product = Product.Create("Original Name", "Description", 1000m).Value;
        await _repository.SaveAsync(product);
        
        var updatedProduct = Product.Create("Updated Name", "New Description", 1500m, product.Id).Value;
        var saveResult = await _repository.SaveAsync(updatedProduct);
        var getResult = await _repository.GetByIdAsync(product.Id);
        
        Assert.True(saveResult.IsSuccess);
        Assert.True(getResult.IsSuccess);
        Assert.Equal("Updated Name", getResult.Value.Name.Value);
        Assert.Equal(1500m, getResult.Value.Price.Amount);
    }
    
    [Fact]
    public async Task Repository_ShouldMaintainDataIsolationPerInstance()
    {
        var repository1 = new InMemoryProductRepository();
        var repository2 = new InMemoryProductRepository();
        
        var product = Product.Create("Laptop", "Description", 1000m).Value;
        
        await repository1.SaveAsync(product);
        
        var result1 = await repository1.GetByIdAsync(product.Id);
        var result2 = await repository2.GetByIdAsync(product.Id);
        
        Assert.True(result1.IsSuccess);
        Assert.False(result2.IsSuccess);
    }
}