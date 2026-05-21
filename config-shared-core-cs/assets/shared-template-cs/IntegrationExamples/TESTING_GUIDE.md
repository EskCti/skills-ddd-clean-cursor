# Guia de Testes Unitários para Skills C#

Este guia demonstra como escrever testes unitários para os diferentes componentes da arquitetura seguindo Clean Architecture e DDD.

## 1. Configuração do Ambiente de Testes

### Arquivo de Projeto de Testes (`Product.Domain.Tests.csproj`)
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.6.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.5">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="coverlet.collector" Version="6.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Moq" Version="4.20.70" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Product.Domain\Product.Domain.csproj" />
    <ProjectReference Include="..\Product.Application\Product.Application.csproj" />
    <ProjectReference Include="..\Shared.Kernel\Shared.Kernel.csproj" />
  </ItemGroup>
</Project>
```

## 2. Testando Value Objects

### Princípios:
- Testar todas as validações
- Testar igualdade baseada em valor
- Testar casos de sucesso e falha

### Exemplo: `ProductNameTests.cs`
```csharp
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
public void Equals_SameValue_ShouldBeEqual()
{
    var name1 = ProductName.Create("Laptop").Value;
    var name2 = ProductName.Create("Laptop").Value;
    
    Assert.Equal(name1, name2);
}
```

## 3. Testando Entities

### Princípios:
- Testar criação com validações
- Testar métodos de domínio
- Testar igualdade baseada em ID
- Testar transições de estado

### Exemplo: `ProductTests.cs`
```csharp
[Fact]
public void Create_ValidProduct_ShouldReturnSuccess()
{
    var name = "Laptop Dell XPS 15";
    var description = "High-performance laptop";
    var price = 1499.99m;
    
    var result = Product.Create(name, description, price, "USD");
    
    Assert.True(result.IsSuccess);
    Assert.Equal(name.Trim(), result.Value.Name.Value);
    Assert.Equal(ProductStatus.Active, result.Value.Status);
    Assert.NotEqual(Guid.Empty, result.Value.Id);
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
```

## 4. Testando Repositories

### Princípios:
- Testar operações CRUD
- Testar cenários de erro
- Usar implementações em memória para testes
- Testar isolamento de dados

### Exemplo: `InMemoryProductRepositoryTests.cs`
```csharp
[Fact]
public async Task SaveAsync_ValidProduct_ShouldReturnSuccess()
{
    var product = Product.Create("Laptop", "Description", 1000m).Value;
    
    var result = await _repository.SaveAsync(product);
    
    Assert.True(result.IsSuccess);
    Assert.Equal(product, result.Value);
}

[Fact]
public async Task GetByIdAsync_NonExistingProduct_ShouldReturnFailure()
{
    var nonExistingId = Guid.NewGuid();
    
    var result = await _repository.GetByIdAsync(nonExistingId);
    
    Assert.False(result.IsSuccess);
    Assert.Contains("not found", result.Errors[0]);
}
```

## 5. Testando Use Cases

### Princípios:
- Mock de dependências (repositórios, serviços)
- Testar validações de entrada
- Testar fluxos de sucesso e erro
- Testar propagação de erros

### Exemplo: `CreateProductUseCaseTests.cs`
```csharp
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
        var input = new CreateProductInput("Laptop", "Description", 1000m);
        var product = Product.Create(input.Name, input.Description, input.Price).Value;
        
        _repositoryMock
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(Result<IEnumerable<Product>>.Success(Array.Empty<Product>()));
        
        _repositoryMock
            .Setup(r => r.SaveAsync(It.IsAny<Product>()))
            .ReturnsAsync(Result<Product>.Success(product));
        
        var result = await _useCase.Execute(input);
        
        Assert.True(result.IsSuccess);
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Once);
    }
    
    [Fact]
    public async Task Execute_InvalidInput_ShouldReturnValidationErrors()
    {
        var input = new CreateProductInput("", "", -100m);
        
        var result = await _useCase.Execute(input);
        
        Assert.False(result.IsSuccess);
        Assert.True(result.Errors.Count >= 3);
        _repositoryMock.Verify(r => r.SaveAsync(It.IsAny<Product>()), Times.Never);
    }
}
```

## 6. Testando Controllers

### Princípios:
- Testar mapeamento de DTOs
- Testar respostas HTTP
- Testar tratamento de erros
- Usar `TestServer` ou `WebApplicationFactory`

### Exemplo: `ProductsControllerTests.cs`
```csharp
public class ProductsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    
    public ProductsControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }
    
    [Fact]
    public async Task CreateProduct_ValidRequest_ShouldReturnCreated()
    {
        var client = _factory.CreateClient();
        var request = new CreateProductRequest("Laptop", "Description", 1000m);
        
        var response = await client.PostAsJsonAsync("/api/products", request);
        
        response.EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var location = response.Headers.Location;
        Assert.NotNull(location);
    }
}
```

## 7. Padrões de Nomenclatura de Testes

### Formato: `[UnitOfWork]_[Scenario]_[ExpectedBehavior]`
```csharp
// Bom
[Fact]
public void Create_ValidName_ShouldReturnSuccess()
[Fact]
public void UpdatePrice_NegativeAmount_ShouldReturnFailure()

// Ruim
[Fact]
public void Test1()
[Fact]
public void CreateProductTest()
```

### Categorização:
```csharp
[Trait("Category", "Unit")]
[Trait("Category", "Integration")]
[Trait("Category", "Functional")]
```

## 8. Boas Práticas

### 1. **Arrange-Act-Assert (AAA)**
```csharp
[Fact]
public void Test_AAA_Pattern()
{
    // Arrange
    var input = "valid input";
    
    // Act
    var result = SUT.Method(input);
    
    // Assert
    Assert.True(result.IsSuccess);
}
```

### 2. **Testes Independentes**
- Cada teste deve ser independente
- Não depender da ordem de execução
- Limpar estado entre testes

### 3. **Nomes Descritivos**
- Use nomes que descrevem o comportamento
- Inclua condições e resultados esperados
- Evite números ou nomes genéricos

### 4. **Cobertura Adequada**
- Teste caminhos felizes e de erro
- Teste casos de borda
- Teste validações e invariantes

### 5. **Mocks vs Stubs**
- Use mocks para verificar interações
- Use stubs para fornecer dados
- Evite over-mocking

## 9. Exemplos de Testes por Skill

### Skill: `core-value-object-cs`
```csharp
// Testar validações de Value Objects
// Testar igualdade baseada em valor
// Testar métodos de domínio específicos
```

### Skill: `core-entity-cs`
```csharp
// Testar criação com validações
// Testar métodos de domínio
// Testar transições de estado
```

### Skill: `core-repository-cs`
```csharp
// Testar operações CRUD
// Testar cenários de erro
// Testar queries específicas
```

### Skill: `core-use-case-cs`
```csharp
// Testar orquestração
// Testar validações de entrada
// Testar propagação de erros
```

### Skill: `backend-controller-cs`
```csharp
// Testar endpoints HTTP
// Testar mapeamento de DTOs
// Testar respostas de erro
```

## 10. Execução e Relatórios

### Comandos:
```bash
# Executar todos os testes
dotnet test

# Executar testes específicos
dotnet test --filter "Category=Unit"

# Com cobertura de código
dotnet test --collect:"XPlat Code Coverage"

# Com relatório HTML
dotnet test --logger html --results-directory TestResults
```

### Configuração do `xunit.runner.json`:
```json
{
  "parallelizeTestCollections": true,
  "maxParallelThreads": 4,
  "diagnosticMessages": false,
  "internalDiagnosticMessages": false
}
```

## 11. Recursos Adicionais

- **xUnit.net**: Framework de testes
- **Moq**: Biblioteca para mocking
- **FluentAssertions**: Asserts mais expressivos
- **Coverlet**: Coleta de cobertura de código
- **ReportGenerator**: Geração de relatórios HTML

## 12. Próximos Passos

1. **Testes de Integração**: Testar interações entre componentes
2. **Testes de Sistema**: Testar fluxos completos de usuário
3. **Testes de Performance**: Medir tempo de resposta e recursos
4. **Testes de Segurança**: Validar autenticação e autorização
5. **Testes de Carga**: Simular múltiplos usuários simultâneos