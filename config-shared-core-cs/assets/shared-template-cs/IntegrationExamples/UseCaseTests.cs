using Xunit;
using Moq;
using Project.Product.Domain.Entities;
using Project.Product.Domain.Repositories;
using Project.Product.Application.UseCases;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Application.Tests.UseCases;

public class CreateProductUseCaseTests
{
    private readonly Mock<IProductRepository> _repositoryMock;
    private readonly CreateProductUseCase _useCase;
    
    public CreateProductUseCaseTests()
    {
        _repositoryMock = new Mock<IProductRepository>();
        _useCase = new CreateProductUseCase(_repositoryMock.Object);
    }
    
    [Fact]
    public async Task Execute_ValidInput_ShouldReturnSuccess()
    {
        var input = new CreateProductInput(
            "Laptop Dell XPS 15",
            "High-performance laptop with 16GB RAM",
            1499.99m,
            "USD"
        );
        
        var product = Product.Create(
            input.Name,
            input.Description,
            input.Price,
            input.Currency
        ).Value;
        
        _repositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(Result<IEnumerable<Product>>.Success(Array.Empty<Product>()));
        
        _repositoryMock
            .Setup(r => r.SaveAsync(It.IsAny<Product>()))
            .ReturnsAsync(Result<Product>.Success(product));
        
        var result = await _useCase.Execute(input);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(product.Id, result.Value.ProductId);
        Assert.Equal(product.Name.Value, result.Value.Name);
        Assert.Equal(product.Price.Amount, result.Value.Price);
        Assert.Equal(product.Price.Currency, result.Value.Currency);
        
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Once);
    }
    
    [Fact]
    public async Task Execute_InvalidInput_ShouldReturnValidationErrors()
    {
        var input = new CreateProductInput("", "", -100m, "");
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.True(result.Errors.Count >= 4);
        Assert.Contains("Name is required", result.Errors);
        Assert.Contains("Description is required", result.Errors);
        Assert.Contains("Price must be greater than zero", result.Errors);
        Assert.Contains("Currency is required", result.Errors);
        
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Never);
    }
    
    [Fact]
    public async Task Execute_DuplicateProductName_ShouldReturnFailure()
    {
        var input = new CreateProductInput("Laptop", "Description", 1000m);
        
        var existingProduct = Product.Create("Laptop", "Old Description", 800m).Value;
        
        _repositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(Result<IEnumerable<Product>>.Success(new[] { existingProduct }));
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("already exists", result.Errors[0]);
        
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Never);
    }
    
    [Fact]
    public async Task Execute_ProductCreationFails_ShouldReturnDomainErrors()
    {
        var input = new CreateProductInput("Laptop", "Description", -100m);
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be negative", result.Errors[0]);
        
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Never);
    }
    
    [Fact]
    public async Task Execute_RepositorySaveFails_ShouldReturnRepositoryError()
    {
        var input = new CreateProductInput("Laptop", "Description", 1000m);
        
        var product = Product.Create(
            input.Name,
            input.Description,
            input.Price,
            input.Currency
        ).Value;
        
        _repositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(Result<IEnumerable<Product>>.Success(Array.Empty<Product>()));
        
        _repositoryMock
            .Setup(r => r.SaveAsync(It.IsAny<Product>()))
            .ReturnsAsync(Result<Product>.Failure("Database connection failed"));
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("Database connection failed", result.Errors[0]);
        
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Once);
    }
    
    [Fact]
    public async Task Execute_GetAllProductsFails_ShouldPropagateError()
    {
        var input = new CreateProductInput("Laptop", "Description", 1000m);
        
        _repositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(Result<IEnumerable<Product>>.Failure("Failed to load products"));
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("Failed to load products", result.Errors[0]);
        
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Never);
    }
}

public class GetProductByIdUseCaseTests
{
    private readonly Mock<IProductRepository> _repositoryMock;
    private readonly GetProductByIdUseCase _useCase;
    
    public GetProductByIdUseCaseTests()
    {
        _repositoryMock = new Mock<IProductRepository>();
        _useCase = new GetProductByIdUseCase(_repositoryMock.Object);
    }
    
    [Fact]
    public async Task Execute_ValidProductId_ShouldReturnProduct()
    {
        var productId = Guid.NewGuid();
        var input = new GetProductByIdInput(productId);
        
        var product = Product.Create(
            "Laptop",
            "Description",
            1000m,
            productId
        ).Value;
        
        _repositoryMock
            .Setup(r => r.GetByIdAsync(productId))
            .ReturnsAsync(Result<Product>.Success(product));
        
        var result = await _useCase.Execute(input);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(product.Id, result.Value.Id);
        Assert.Equal(product.Name.Value, result.Value.Name);
        Assert.Equal(product.Description.Value, result.Value.Description);
        Assert.Equal(product.Price.Amount, result.Value.Price);
        Assert.Equal(product.Price.Currency, result.Value.Currency);
        Assert.Equal(product.Status.ToString(), result.Value.Status);
        Assert.Equal(product.CreatedAt, result.Value.CreatedAt);
        Assert.Equal(product.UpdatedAt, result.Value.UpdatedAt);
    }
    
    [Fact]
    public async Task Execute_EmptyProductId_ShouldReturnValidationError()
    {
        var input = new GetProductByIdInput(Guid.Empty);
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("Product ID is required", result.Errors[0]);
        
        _repositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }
    
    [Fact]
    public async Task Execute_ProductNotFound_ShouldReturnRepositoryError()
    {
        var productId = Guid.NewGuid();
        var input = new GetProductByIdInput(productId);
        
        _repositoryMock
            .Setup(r => r.GetByIdAsync(productId))
            .ReturnsAsync(Result<Product>.Failure("Product not found"));
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
        Assert.Contains("Product not found", result.Errors[0]);
    }
    
    [Fact]
    public async Task Execute_RepositoryThrowsException_ShouldReturnFailure()
    {
        var productId = Guid.NewGuid();
        var input = new GetProductByIdInput(productId);
        
        _repositoryMock
            .Setup(r => r.GetByIdAsync(productId))
            .ThrowsAsync(new Exception("Database error"));
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.NotEmpty(result.Errors);
    }
}