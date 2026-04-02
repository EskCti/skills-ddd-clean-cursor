# Controller Pattern (C#)

## Paths de referência

- Controllers:
  - `src/Project.Backend/Controllers/AuthController.cs`
  - `src/Project.Backend/Controllers/ProductController.cs`

## Papel do controller

- Converter HTTP request (DTO de entrada) em input para o use case.
- Controlar autenticação/autorização via Attributes (`[Authorize]`, `[AllowAnonymous]`).
- Traduzir o `Result<T>` do core para uma `ActionResult` apropriada (Ok, BadRequest, NotFound).

## Checklist de implementação

- [ ] `[ApiController]` e `[Route("api/[controller]")]` definidos.
- [ ] Atributos de método HTTP corretos (`[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]`).
- [ ] Injeção de dependência via construtor (Interfaces dos Use Cases).
- [ ] Uso de DTOs para Request e Response.
- [ ] Mapeamento do `Result` para `ActionResult`:
  - `Success` -> `Ok(value)` ou `CreatedAtAction(...)`
  - `Failure` -> `BadRequest(errors)` ou `NotFound(errors)`
- [ ] Anotações de Swagger para documentação (`[ProducesResponseType]`).

## Exemplo mínimo (C#)

```csharp
using Microsoft.AspNetCore.Mvc;
using Project.Core.Application.UseCases.Product;
using Project.Shared.Kernel.Results;

namespace Project.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ICreateProductUseCase _createProduct;

    public ProductsController(ICreateProductUseCase createProduct)
    {
        _createProduct = createProduct;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateProductRequest request)
    {
        var input = new CreateProductInput(request.Name, request.Price);
        var result = await _createProduct.Execute(input);

        if (result.IsFailure)
            return BadRequest(result.Errors);

        return CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetById(Guid id)
    {
        // TODO: inject IGetProductByIdQuery and call
        return NotFound();
    }
}
```

## Armadilhas comuns

- Colocar lógica de negócio ou acesso a banco direto no controller.
- Não usar `async/await` corretamente (bloqueando a thread).
- Retornar a entidade de domínio diretamente (expor o modelo interno).
