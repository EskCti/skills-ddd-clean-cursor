# E2E Test Pattern (C#)

## Escopo

Testes E2E de API com `WebApplicationFactory<Program>` — projeto `tests/*.IntegrationTests/`.

## Estrutura (bootstrap `config-project-cs`)

```
tests/
├── ProjectName.UnitTests/           ← unit (test-unit-cs)
└── ProjectName.IntegrationTests/    ← E2E API (este skill)
    └── Api/
        └── CustomerControllerE2ETests.cs
```

## Exemplo

```csharp
public class CustomerControllerE2ETests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CustomerControllerE2ETests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostThenGet_ReturnsCustomer()
    {
        var payload = JsonSerializer.Serialize(new
        {
            name = "João",
            email = "joao@example.com",
            cpf = "12345678901"
        });
        var create = await _client.PostAsync("/api/customers",
            new StringContent(payload, Encoding.UTF8, "application/json"));
        create.EnsureSuccessStatusCode();

        var created = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
        var id = created.RootElement.GetProperty("id").GetString();

        var get = await _client.GetAsync($"/api/customers/{id}");
        get.EnsureSuccessStatusCode();
    }
}
```

## Program.cs

Expor entry point para testes:

```csharp
public partial class Program { }
```

## CI

```bash
dotnet test apps/backend/tests/ProjectName.IntegrationTests/ProjectName.IntegrationTests.csproj
```

## Checklist

- [ ] WebApplicationFactory configurada
- [ ] Fluxo POST → GET
- [ ] Banco de teste (Postgres service no CI)
