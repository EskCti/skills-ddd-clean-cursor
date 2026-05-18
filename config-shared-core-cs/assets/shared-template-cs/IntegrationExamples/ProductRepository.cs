using Project.Product.Domain.Entities;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Domain.Repositories;

public interface IProductRepository
{
    Task<Result<Product>> GetByIdAsync(Guid id);
    Task<Result<IEnumerable<Product>>> GetAllAsync();
    Task<Result<IEnumerable<Product>>> GetActiveProductsAsync();
    Task<Result<Product>> SaveAsync(Product product);
    Task<Result> DeleteAsync(Guid id);
    Task<Result<bool>> ExistsAsync(Guid id);
}

public class InMemoryProductRepository : IProductRepository
{
    private readonly Dictionary<Guid, Product> _products = new();

    public Task<Result<Product>> GetByIdAsync(Guid id)
    {
        if (_products.TryGetValue(id, out var product))
            return Task.FromResult(Result<Product>.Success(product));

        return Task.FromResult(Result<Product>.Failure($"Product with id {id} not found"));
    }

    public Task<Result<IEnumerable<Product>>> GetAllAsync()
    {
        var products = _products.Values.AsEnumerable();
        return Task.FromResult(Result<IEnumerable<Product>>.Success(products));
    }

    public Task<Result<IEnumerable<Product>>> GetActiveProductsAsync()
    {
        var activeProducts = _products.Values
            .Where(p => p.Status == ProductStatus.Active)
            .AsEnumerable();
        
        return Task.FromResult(Result<IEnumerable<Product>>.Success(activeProducts));
    }

    public Task<Result<Product>> SaveAsync(Product product)
    {
        try
        {
            _products[product.Id] = product;
            return Task.FromResult(Result<Product>.Success(product));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<Product>.Failure($"Failed to save product: {ex.Message}"));
        }
    }

    public Task<Result> DeleteAsync(Guid id)
    {
        if (_products.Remove(id))
            return Task.FromResult(Result.Success());

        return Task.FromResult(Result.Failure($"Product with id {id} not found"));
    }

    public Task<Result<bool>> ExistsAsync(Guid id)
    {
        var exists = _products.ContainsKey(id);
        return Task.FromResult(Result<bool>.Success(exists));
    }
}