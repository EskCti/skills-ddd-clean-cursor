using Microsoft.AspNetCore.Mvc;
using Project.Product.Application.UseCases;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Product.Infrastructure.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly CreateProductUseCase _createProductUseCase;
    private readonly GetProductByIdUseCase _getProductByIdUseCase;

    public ProductsController(
        CreateProductUseCase createProductUseCase,
        GetProductByIdUseCase getProductByIdUseCase)
    {
        _createProductUseCase = createProductUseCase;
        _getProductByIdUseCase = getProductByIdUseCase;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateProductOutput>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var input = new CreateProductInput(
            request.Name,
            request.Description,
            request.Price,
            request.Currency
        );

        var result = await _createProductUseCase.Execute(input);

        if (result.IsFailure)
            return BadRequest(new { errors = result.Errors });

        return CreatedAtAction(
            nameof(GetProductById),
            new { id = result.Value.ProductId },
            result.Value
        );
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetProductByIdOutput>> GetProductById(Guid id)
    {
        var input = new GetProductByIdInput(id);
        var result = await _getProductByIdUseCase.Execute(input);

        if (result.IsFailure)
            return NotFound(new { errors = result.Errors });

        return Ok(result.Value);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<GetProductByIdOutput>>> GetAllProducts()
    {
        // Implementação simplificada para exemplo
        return Ok(Array.Empty<GetProductByIdOutput>());
    }
}

// DTOs para request/response da API
public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price,
    string Currency = "USD"
);

public record CreateProductResponse(
    Guid ProductId,
    string Name,
    decimal Price,
    string Currency,
    DateTime CreatedAt
);