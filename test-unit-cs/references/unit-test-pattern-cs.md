# Unit Test Pattern (C#)

## Meta de cobertura

| Escopo | Mínimo |
|--------|--------|
| `*.Domain.*` + `*.Application.*` | **95% lines** (Coverlet) |
| Infrastructure | ≥80% recomendado |

## Paths

```
apps/backend/tests/ProjectName.UnitTests/
├── Domain/
│   ├── Entities/CustomerTests.cs
│   └── ValueObjects/EmailTests.cs
└── Application/
    └── UseCases/CreateCustomerUseCaseTests.cs
```

## O que testar

- **record VO**: `Create` válido/inválido, igualdade
- **Entity**: factory, invariantes, métodos de domínio
- **UseCase**: mock `IRepository` com Moq ou NSubstitute
- **Result&lt;T&gt;**: `IsSuccess` / `IsFailure` e erros

## ProjectName.UnitTests.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="coverlet.collector" Version="6.0.2">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.11.1" />
    <PackageReference Include="xunit" Version="2.9.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.2" />
    <PackageReference Include="Moq" Version="4.20.72" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\..\src\ProjectName.Core\ProjectName.Core.csproj" />
  </ItemGroup>
</Project>
```

## Executar com coverage

```bash
dotnet test apps/backend/tests/ProjectName.UnitTests/ProjectName.UnitTests.csproj \
  --collect:"XPlat Code Coverage" \
  --results-directory ./coverage

# Gate ≥95% (CI usa reportgenerator ou script)
```

## Exemplo

```csharp
public class CreateCustomerUseCaseTests
{
    [Fact]
    public async Task Execute_WhenCpfExists_ReturnsFailure()
    {
        var repo = new Mock<ICustomerRepository>();
        repo.Setup(r => r.FindByCPFAsync("123")).ReturnsAsync(Result.Success<Customer?>(existing));
        var sut = new CreateCustomerUseCase(repo.Object);

        var result = await sut.Execute(new CreateCustomerInDto("A", "a@b.com", "123"));

        Assert.False(result.IsSuccess);
    }
}
```

## Checklist

- [ ] xUnit + Moq/NSubstitute
- [ ] Coverlet collector no csproj de testes
- [ ] Testes para todo VO, Entity e UseCase público
- [ ] CI (`config-cicd-cs`) com coverage gate ≥95%
