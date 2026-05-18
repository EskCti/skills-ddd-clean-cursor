using Project.Product.Domain.Entities;
using Project.Product.Domain.Repositories;
using Project.Shared.Kernel.Application.UseCases;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Application.UseCases;

public record GetProductByIdInput(Guid ProductId);

public record GetProductByIdOutput(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    string Currency,
    string Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public class GetProductByIdUseCase : IUseCase<GetProductByIdInput, GetProductByIdOutput>
{
    private readonly IProductRepository _productRepository;

    public GetProductByIdUseCase(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<GetProductByIdOutput>> Execute(GetProductByIdInput input)
    {
        // 1. Validar entrada
        if (input.ProductId == Guid.Empty)
            return Result<GetProductByIdOutput>.Failure("Product ID is required");

        // 2. Buscar produto no repositório
        var productResult = await _productRepository.GetByIdAsync(input.ProductId);
        if (productResult.IsFailure)
            return Result<GetProductByIdOutput>.Failure(productResult.Errors);

        // 3. Mapear para DTO de saída
        var product = productResult.Value;
        var output = new GetProductByIdOutput(
            product.Id,
            product.Name.Value,
            product.Description.Value,
            product.Price.Amount,
            product.Price.Currency,
            product.Status.ToString(),
            product.CreatedAt,
            product.UpdatedAt
        );

        return Result<GetProductByIdOutput>.Success(output);
    }
}