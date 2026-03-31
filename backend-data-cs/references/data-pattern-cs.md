# Data Pattern (C# / EF Core)

## Paths principais

- DbContext e Configurações:
  - `src/Project.Infrastructure/Persistence/Contexts/AppDbContext.cs`
  - `src/Project.Infrastructure/Persistence/Configurations/*.Configuration.cs`
- Migrações:
  - `src/Project.Infrastructure/Persistence/Migrations/`
- Modelos de Persistência (Dbo):
  - `src/Project.Infrastructure/Persistence/Models/*.Dbo.cs` (ou `*.Entity.cs` se isolado)
- Adapters (Repositories/Queries):
  - `src/Project.Infrastructure/Persistence/Repositories/*.Repository.cs`
  - `src/Project.Infrastructure/Persistence/Queries/*.Query.cs`

## Convenções observadas

- Separação entre Modelo de Domínio (`Core`) e Modelo de Persistência (`Infrastructure`).
- Uso de `Dbo` (Database Object) ou sufixo `EfEntity` para evitar colisão com Entidades.
- Mapeamento explícito via Fluent API (Pasta `Configurations`).
- Adapters implementam interfaces de `Core` e retornam `Result<T>`.
- Uso de `Task<Result<T>>` para operações assíncronas.

## Checklist de alterações

### 1. Modelagem EF Core

- [ ] Criar/Ajustar classe de persistência (`CustomerDbo`).
- [ ] Definir mapeamentos em uma nova classe `IEntityTypeConfiguration<T>`.
- [ ] Registrar a configuração no `OnModelCreating` do `AppDbContext`.

### 2. Migrações

- [ ] Gerar migração: `dotnet ef migrations add Name --project src/Project.Infrastructure --startup-project src/Project.Backend`.
- [ ] Validar o SQL gerado.
- [ ] Aplicar: `dotnet ef database update`.

### 3. Implementação do Adapter

- [ ] Implementar `ToDomain()` para converter Dbo -> Entidade.
- [ ] Implementar `FromDomain()` para converter Entidade -> Dbo.
- [ ] Usar `_context.Set<T>().AddAsync(...)` ou `Update()`.
- [ ] Tratar exceções de banco e retornar `Result.Failure`.
- [ ] Para leitura, usar `.AsNoTracking()` e projetar diretamente para DTOs.

## Exemplo de Mapeamento (Adapter)

```csharp
public async Task<Result<Customer>> GetById(Guid id)
{
    var dbo = await _context.Customers
        .AsNoTracking()
        .FirstOrDefaultAsync(c => c.Id == id);

    if (dbo == null) return Result.Failure<Customer>("Customer not found");

    return ToDomain(dbo);
}

private Result<Customer> ToDomain(CustomerDbo dbo)
{
    return Customer.Create(new CustomerProps(dbo.Name, dbo.Email, dbo.Id));
}
```

## Armadilhas comuns

- Esquecer de atualizar o `DbContext` após criar uma nova `Configuration`.
- Retornar o `Dbo` diretamente para o `Core` (quebra o Clean Architecture).
- Não usar `AsNoTracking()` em queries de leitura, causando overhead de memória.
- Ignorar o tratamento de erros em operações de escrita (ex: duplicidade de chave).
