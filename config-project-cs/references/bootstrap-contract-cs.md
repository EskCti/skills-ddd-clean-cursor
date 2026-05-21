# C# Project Bootstrap Contract

## Goal

Padronizar o bootstrap de uma solução .NET (C#) com Clean Architecture para:

- `src/*.Backend` (ASP.NET Core API)
- `src/*.Core` (Domínio e Aplicação — sem dependências de infra/web)
- `src/*.Infrastructure` (Persistência, EF Core, Dapper)
- `src/*.Shared.Kernel` (Abstrações transversais de domínio)

## Steps Applied

1. Inicializar solução (`dotnet new sln`).
2. Criar projetos:
   - `src/*.Backend` (Template: `webapi`)
   - `src/*.Core` (Template: `classlib`)
   - `src/*.Infrastructure` (Template: `classlib`)
   - `src/*.Shared.Kernel` (Template: `classlib`)
3. Configurar referências:
   - `Backend` -> `Infrastructure`, `Core`
   - `Infrastructure` -> `Core`
   - `Core` -> `Shared.Kernel`
4. Configurar `.csproj` global:
   - `<Nullable>enable</Nullable>`
   - `<ImplicitUsings>enable</ImplicitUsings>`
   - `<TargetFramework>net8.0</TargetFramework>`
5. Setup de `Program.cs` no Backend:
   - Configuração de Dependency Injection (DI).
   - Middleware de Exception Handling.
   - Setup de Swagger/OpenAPI.
   - Configuração de CORS para `http://localhost:3000`.
6. Configurar `.gitignore` para o ecossistema .NET.
7. Criar `.env` e `.env.example` com:
   - `ConnectionStrings__DefaultConnection=Host=localhost;Database=appdb;Username=postgres;Password=postgres`
   - `Jwt__Secret=change-me-to-a-very-long-secret-key`
   - `PORT=5000`
8. Criar `docker-compose.yml` com Postgres.
9. Criar projetos de teste:
   - `tests/*.UnitTests` — xUnit + Moq + Coverlet (referência `test-unit-cs`)
   - `tests/*.IntegrationTests` — `WebApplicationFactory<Program>` (referência `test-e2e-cs`)
10. Expor `public partial class Program { }` no Backend para integration tests.
11. Validar: `dotnet build` && `dotnet test`.

## `.gitignore` esperado

```
[Aa]bin/
[Aa]obj/
bin/
obj/
*.user
*.userosscache
*.sln.doccache
.vs/
.vscode/
.env
!.env.example
```

## Dependência entre projetos

- `src/*.Backend/Project.Backend.csproj`:
  ```xml
  <ItemGroup>
    <ProjectReference Include="..\Project.Infrastructure\Project.Infrastructure.csproj" />
    <ProjectReference Include="..\Project.Core\Project.Core.csproj" />
  </ItemGroup>
  ```
- `src/*.Infrastructure/Project.Infrastructure.csproj`:
  ```xml
  <ItemGroup>
    <ProjectReference Include="..\Project.Core\Project.Core.csproj" />
  </ItemGroup>
  ```
- `src/*.Core/Project.Core.csproj`:
  ```xml
  <ItemGroup>
    <ProjectReference Include="..\Project.Shared.Kernel\Project.Shared.Kernel.csproj" />
  </ItemGroup>
  ```

## Program.cs mínimo

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## Notes

- O setup é idempotente: pula etapas já atendidas.
- Projetos usam as versões LTS mais recentes do .NET (net8.0).
- Módulos adicionais seguem o padrão `src/Project.<ModuleName>`.
