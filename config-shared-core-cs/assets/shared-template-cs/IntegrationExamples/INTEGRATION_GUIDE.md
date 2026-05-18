# Guia de Integração Completa - Fluxo Entity → Repository → Use Case → Controller

Este guia demonstra como os diferentes skills C# trabalham juntos em um fluxo completo de aplicação seguindo Clean Architecture e DDD.

## Visão Geral do Fluxo

```
HTTP Request → Controller → Use Case → Entity/Value Objects → Repository → Database
HTTP Response ← Controller ← Use Case ← Entity/Value Objects ← Repository ← Database
```

## 1. Value Objects (Domínio)

**Responsabilidade**: Representar conceitos de domínio com validações embutidas.

### Exemplo: `Money.cs`
```csharp
public record Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    public static Result<Money> Create(decimal amount, string currency = "USD")
    {
        // Validações embutidas
        if (amount < 0) return Result<Money>.Failure("Amount cannot be negative");
        if (currency.Length != 3) return Result<Money>.Failure("Currency must be 3-letter code");
        
        return Result<Money>.Success(new Money(amount, currency.ToUpperInvariant()));
    }
}
```

**Características**:
- Imutável (record)
- Validações no método factory `Create`
- Retorna `Result<T>` para tratamento de erros
- Value-based equality

## 2. Entity (Domínio)

**Responsabilidade**: Representar entidades de negócio com identidade e ciclo de vida.

### Exemplo: `Product.cs`
```csharp
public class Product : Entity
{
    public ProductName Name { get; private set; }
    public Money Price { get; private set; }

    private Product(ProductName name, Money price, Guid? id = null)
    {
        Id = id ?? Guid.NewGuid();
        Name = name;
        Price = price;
    }

    public static Result<Product> Create(string name, decimal price, string currency = "USD")
    {
        // Delegar validações para Value Objects
        var nameResult = ProductName.Create(name);
        var priceResult = Money.Create(price, currency);
        
        // Combinar resultados
        if (nameResult.IsFailure || priceResult.IsFailure)
        {
            var errors = nameResult.Errors.Concat(priceResult.Errors);
            return Result<Product>.Failure(errors);
        }
        
        return Result<Product>.Success(new Product(nameResult.Value, priceResult.Value));
    }
}
```

**Características**:
- Construtor privado
- Método factory `Create` com validações
- Propriedades com `private set`
- Encapsulamento de regras de negócio

## 3. Repository (Domínio/Infraestrutura)

**Responsabilidade**: Abstrair acesso a dados.

### Interface (Domínio): `IProductRepository.cs`
```csharp
public interface IProductRepository
{
    Task<Result<Product>> GetByIdAsync(Guid id);
    Task<Result<Product>> SaveAsync(Product product);
}
```

### Implementação (Infraestrutura): `InMemoryProductRepository.cs`
```csharp
public class InMemoryProductRepository : IProductRepository
{
    private readonly Dictionary<Guid, Product> _products = new();

    public Task<Result<Product>> GetByIdAsync(Guid id)
    {
        if (_products.TryGetValue(id, out var product))
            return Task.FromResult(Result<Product>.Success(product));

        return Task.FromResult(Result<Product>.Failure($"Product not found"));
    }
}
```

**Características**:
- Interface no domínio
- Implementação na infraestrutura
- Retorna `Result<T>` para erros de persistência
- Injeção de dependência

## 4. Use Case (Aplicação)

**Responsabilidade**: Orquestrar fluxos de negócio.

### Exemplo: `CreateProductUseCase.cs`
```csharp
public class CreateProductUseCase : IUseCase<CreateProductInput, CreateProductOutput>
{
    private readonly IProductRepository _productRepository;

    public CreateProductUseCase(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<Result<CreateProductOutput>> Execute(CreateProductInput input)
    {
        // 1. Validar entrada
        var validationErrors = ValidateInput(input);
        if (validationErrors.Any())
            return Result<CreateProductOutput>.Failure(validationErrors);

        // 2. Criar entidade de domínio
        var productResult = Product.Create(input.Name, input.Price, input.Currency);
        if (productResult.IsFailure)
            return Result<CreateProductOutput>.Failure(productResult.Errors);

        // 3. Persistir
        var saveResult = await _productRepository.SaveAsync(productResult.Value);
        if (saveResult.IsFailure)
            return Result<CreateProductOutput>.Failure(saveResult.Errors);

        // 4. Retornar resultado
        var product = saveResult.Value;
        var output = new CreateProductOutput(product.Id, product.Name.Value, product.Price.Amount);
        
        return Result<CreateProductOutput>.Success(output);
    }
}
```

**Características**:
- Implementa `IUseCase<TIn, TOut>`
- Injeção de dependências
- Orquestração de domínio e infraestrutura
- Tratamento consistente de erros

## 5. Controller (Interface)

**Responsabilidade**: Lidar com HTTP requests/responses.

### Exemplo: `ProductsController.cs`
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly CreateProductUseCase _createProductUseCase;

    public ProductsController(CreateProductUseCase createProductUseCase)
    {
        _createProductUseCase = createProductUseCase;
    }

    [HttpPost]
    public async Task<ActionResult<CreateProductOutput>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var input = new CreateProductInput(request.Name, request.Price, request.Currency);
        var result = await _createProductUseCase.Execute(input);

        if (result.IsFailure)
            return BadRequest(new { errors = result.Errors });

        return CreatedAtAction(nameof(GetProductById), new { id = result.Value.ProductId }, result.Value);
    }
}
```

**Características**:
- Herda de `ControllerBase`
- Atributos de rota e verbos HTTP
- Mapeamento de DTOs de request/response
- Conversão de `Result` para `ActionResult`

## 6. Configuração de Dependências

### `Program.cs` ou `Startup.cs`
```csharp
// Registrar repositórios
builder.Services.AddScoped<IProductRepository, InMemoryProductRepository>();

// Registrar use cases
builder.Services.AddScoped<CreateProductUseCase>();
builder.Services.AddScoped<GetProductByIdUseCase>();

// Registrar controllers
builder.Services.AddControllers();
```

## 7. Fluxo de Erros

```
1. Validação de Value Object → Result.Failure(["Invalid amount"])
2. Validação de Entity → Result.Failure(["Name too short", "Price negative"])
3. Erro de Repository → Result.Failure(["Database connection failed"])
4. Use Case propaga erros → Result.Failure([...])
5. Controller converte → BadRequest({ errors: [...] })
```

## 8. Benefícios desta Arquitetura

1. **Testabilidade**: Cada componente pode ser testado isoladamente
2. **Manutenibilidade**: Mudanças em uma camada não afetam outras
3. **Flexibilidade**: Trocar implementações (ex: banco de dados) é fácil
4. **Clareza**: Responsabilidades bem definidas
5. **Consistência**: Padrão `Result` para tratamento de erros em toda aplicação

## 9. Próximos Passos

1. Adicionar **Domain Events** para comunicação entre bounded contexts
2. Implementar **CQRS** com queries separadas de commands
3. Adicionar **Caching** com Redis ou MemoryCache
4. Implementar **Background Jobs** para operações assíncronas
5. Adicionar **Monitoring** e logging estruturado

## 10. Exemplos de Uso

Consulte os arquivos neste diretório para exemplos completos:
- `ProductEntity.cs` - Entidade com Value Objects
- `ProductValueObjects.cs` - Value Objects com validações
- `ProductRepository.cs` - Interface e implementação
- `CreateProductUseCase.cs` - Use Case de criação
- `GetProductByIdUseCase.cs` - Use Case de consulta
- `ProductsController.cs` - Controller com endpoints REST