using Project.Product.Domain.Entities;
using Project.Product.Domain.Repositories;
using Project.Shared.Kernel.Application.UseCases;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Application.UseCases;

public record CreateProductInput(string Name, string Description, decimal Price, string Currency = "USD");

public record CreateProductOutput(Guid ProductId, string Name, decimal Price, string Currency);

public class CreateProductUseCase : IUseCase<CreateProductInput, CreateProductOutput>
{
    private readonly IProductRepository _productRepository;

    public CreateProductUseCase(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<CreateProductOutput>> Execute(CreateProductInput input)
    {
        // 1. Validar entrada básica
        var validationErrors = ValidateInput(input);
        if (validationErrors.Any())
            return Result<CreateProductOutput>.Failure(validationErrors);

        // 2. Verificar se produto com mesmo nome já existe (simulação)
        var existingProducts = await _productRepository.GetAllAsync();
        if (existingProducts.IsSuccess)
        {
            var duplicateName = existingProducts.Value
                .Any(p => p.Name.Value.Equals(input.Name, StringComparison.OrdinalIgnoreCase));
            
            if (duplicateName)
                return Result<CreateProductOutput>.Failure($"Product with name '{input.Name}' already exists");
        }

        // 3. Criar entidade de domínio
        var productResult = Product.Create(input.Name, input.Description, input.Price, input.Currency);
        if (productResult.IsFailure)
            return Result<CreateProductOutput>.Failure(productResult.Errors);

        // 4. Persistir no repositório
        var saveResult = await _productRepository.SaveAsync(productResult.Value);
        if (saveResult.IsFailure)
            return Result<CreateProductOutput>.Failure(saveResult.Errors);

        // 5. Retornar resultado
        var product = saveResult.Value;
        var output = new CreateProductOutput(
            product.Id,
            product.Name.Value,
            product.Price.Amount,
            product.Price.Currency
        );

        return Result<CreateProductOutput>.Success(output);
    }

    private List<string> ValidateInput(CreateProductInput input)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(input.Name))
            errors.Add("Name is required");

        if (string.IsNullOrWhiteSpace(input.Description))
            errors.Add("Description is required");

        if (input.Price <= 0)
            errors.Add("Price must be greater than zero");

        if (string.IsNullOrWhiteSpace(input.Currency))
            errors.Add("Currency is required");

        return errors;
    }
}