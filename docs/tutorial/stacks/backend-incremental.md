# Stack: Backend Incremental (NestJS / Spring / ASP.NET)

**Combinação**: Backend isolado — **NestJS**, **Spring Boot (Kotlin)** ou **ASP.NET Core (C#)** — sem frontend/mobile no mesmo passo

**Pré-requisito**: [Tutorial 01 — Análise](../01-pipeline-discovery-planning.md) · Use quando o [Hub Full-Stack](../02-fullstack-project-setup.md) indicar migração Strangler Fig ou EP de backend antes da UI

Agents usados: `Config Project Full-Stack` → `Config Project (C#)` → `Config Shared Core (C#)` → `Config New Module (C#)` → `Core * (C#)` → `Backend * (C#)` → `Unit Tests (C#)` → `E2E Tests (C#)`

**Cenário**: Backlog gerado no Tutorial 01. Implementamos o **EP-002: BC Customers** em **C#** (ASP.NET Core + EF Core). Para projeto completo com frontend e mobile, escolha uma combinação no [Hub Full-Stack](../02-fullstack-project-setup.md).

---

## Passo 0 — Bootstrap do Projeto (uma vez por projeto)

Antes de qualquer módulo, o projeto precisa da estrutura base.

### Agent: `Config Project (C#)`

> Inicialize o projeto C# com solução multi-projeto Clean Architecture. Nome do projeto: `LojaDDD`.

**O que cria:**

```
LojaDDD/
├── LojaDDD.sln
├── docker-compose.yml          ← Postgres para dev local
├── tests/
│   ├── LojaDDD.UnitTests/      ← xUnit + Coverlet (test-unit-cs)
│   └── LojaDDD.IntegrationTests/ ← WebApplicationFactory (test-e2e-cs)
├── src/
│   ├── LojaDDD.Backend/        ← ASP.NET Core API
│   ├── LojaDDD.Core/           ← Domain + Application
│   ├── LojaDDD.Infrastructure/ ← EF Core + adapters
│   └── LojaDDD.Shared.Kernel/  ← Entity, VO, Result base
```

Após o bootstrap, valide a solução:

```bash
dotnet restore && dotnet build && dotnet test
```

O template já inclui `ResultTests` (unit) e `HealthEndpointTests` (integration via `WebApplicationFactory`).

### Agent: `Config Shared Core (C#)`

> Configure o Shared Kernel com as classes base: Entity, ValueObject, Result, IUseCase, IRepository.

**O que cria** em `LojaDDD.Shared.Kernel/`:

```csharp
// Entity base
public abstract class Entity
{
    public Guid Id { get; protected set; }
    public override bool Equals(object? obj) => obj is Entity e && Id == e.Id;
    public override int GetHashCode() => Id.GetHashCode();
}

// ValueObject base
public abstract record ValueObject;

// Result<T> para operações seguras
public class Result<T> { ... }
```

### Agent: `Config EF Core (C#)`

> Configure o EF Core com DbContext, appsettings.json e docker-compose para Postgres.

---

## Passo 1 — Scaffold do Módulo

### Agent: `Config New Module (C#)`

> Crie o módulo Customers no projeto LojaDDD em C#.

**O que cria** — estrutura do módulo nos projetos certos:

```
src/LojaDDD.Core/
└── Customers/
    ├── Domain/
    │   ├── Entities/         ← Customer.cs
    │   ├── ValueObjects/     ← Email.cs, CPF.cs, CustomerName.cs
    │   ├── Services/         ← (domínio)
    │   └── Repositories/     ← ICustomerRepository.cs
    ├── Application/
    │   ├── DTOs/             ← CreateCustomerInDto.cs, CustomerOutDto.cs
    │   ├── UseCases/         ← CreateCustomerUseCase.cs
    │   └── Queries/          ← FindCustomerByIdQuery.cs

src/LojaDDD.Infrastructure/
└── Customers/
    └── Persistence/
        ├── CustomerDbo.cs              ← EF Core entity (separada do domínio)
        ├── CustomerDboConfiguration.cs ← Fluent API
        └── CustomerEfRepository.cs     ← implementa ICustomerRepository

src/LojaDDD.Backend/
└── Controllers/
    └── CustomerController.cs
```

---

## Passo 2 — Domain Layer (inside-out)

### 2.1 — Agent: `Core Value Object (C#)`

**Prompt para criar o VO Email:**

> Crie o Value Object `Email` em C# no módulo Customers. Validação: formato válido, normalizar para lowercase, não pode ser nulo.

**Código gerado** (`CustomerName.cs` — exemplo análogo):

```csharp
public record CustomerName : ValueObject
{
    public string Value { get; }

    private CustomerName(string value) => Value = value;

    public static Result<CustomerName> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<CustomerName>("Name is required");

        var trimmed = value.Trim();
        if (trimmed.Length < 2 || trimmed.Length > 100)
            return Result.Failure<CustomerName>("Name must be between 2 and 100 characters");

        return Result.Success(new CustomerName(trimmed));
    }
}
```

**Repita** para `Email`, `CPF` (com validação de dígitos verificadores).

### 2.2 — Agent: `Core Entity (C#)`

**Prompt:**

> Crie a entidade `Customer` em C# com os VOs CustomerName, Email e CPF. Aggregate root. Inclua método `Deactivate()`.

**Código gerado** (`Customer.cs`):

```csharp
public class Customer : Entity
{
    public CustomerName Name { get; private set; }
    public Email Email { get; private set; }
    public CPF CPF { get; private set; }
    public bool IsActive { get; private set; }

    private Customer(CustomerName name, Email email, CPF cpf, Guid? id = null)
    {
        Id = id ?? Guid.NewGuid();
        Name = name;
        Email = email;
        CPF = cpf;
        IsActive = true;
    }

    public static Result<Customer> Create(string name, string email, string cpf)
    {
        var nameResult = CustomerName.Create(name);
        var emailResult = Email.Create(email);
        var cpfResult = CPF.Create(cpf);

        var errors = Result.CombineErrors(nameResult, emailResult, cpfResult);
        if (errors.Any()) return Result.Failure<Customer>(errors);

        return Result.Success(new Customer(nameResult.Value, emailResult.Value, cpfResult.Value));
    }

    public void Deactivate() => IsActive = false;
}
```

### 2.3 — Agent: `Core Repository (C#)`

**Prompt:**

> Crie a interface `ICustomerRepository` em C# para o aggregate Customer. Operações: Create, FindById, FindByCPF, FindAll (paginado), Update.

```csharp
public interface ICustomerRepository
{
    Task<Result<Customer>> CreateAsync(Customer customer);
    Task<Result<Customer?>> FindByIdAsync(Guid id);
    Task<Result<Customer?>> FindByCPFAsync(string cpf);
    Task<Result<IEnumerable<Customer>>> FindAllAsync(int page, int pageSize);
    Task<Result> UpdateAsync(Customer customer);
}
```

---

## Passo 3 — Application Layer

### 3.1 — Agent: `Core DTO (C#)`

**Prompt:**

> Crie os DTOs `CreateCustomerInDto` e `CustomerOutDto` para o módulo Customers em C#.

```csharp
public record CreateCustomerInDto(string Name, string Email, string CPF);

public record CustomerOutDto(Guid Id, string Name, string Email, string CPF, bool IsActive);
```

### 3.2 — Agent: `Core Use Case (C#)`

**Prompt:**

> Crie o `CreateCustomerUseCase` em C# que: valida se CPF já existe, cria o Customer, persiste e retorna `CustomerOutDto`.

```csharp
public class CreateCustomerUseCase : IUseCase<CreateCustomerInDto, CustomerOutDto>
{
    private readonly ICustomerRepository _repository;

    public CreateCustomerUseCase(ICustomerRepository repository)
        => _repository = repository;

    public async Task<Result<CustomerOutDto>> Execute(CreateCustomerInDto input)
    {
        // Verificar CPF duplicado
        var existing = await _repository.FindByCPFAsync(input.CPF);
        if (existing.Value is not null)
            return Result.Failure<CustomerOutDto>("CPF already registered");

        // Criar entidade (invariantes validados internamente)
        var customerResult = Customer.Create(input.Name, input.Email, input.CPF);
        if (customerResult.IsFailure) return Result.Failure<CustomerOutDto>(customerResult.Errors);

        // Persistir
        var createResult = await _repository.CreateAsync(customerResult.Value);
        if (createResult.IsFailure) return Result.Failure<CustomerOutDto>(createResult.Errors);

        return Result.Success(new CustomerOutDto(
            customerResult.Value.Id,
            customerResult.Value.Name.Value,
            customerResult.Value.Email.Value,
            customerResult.Value.CPF.Value,
            customerResult.Value.IsActive
        ));
    }
}
```

### 3.3 — Agent: `Core Query CQRS (C#)`

**Prompt:**

> Crie a query `FindCustomerByIdQuery` em C# que retorna `CustomerOutDto` por ID.

---

## Passo 4 — Infrastructure Layer

### Agent: `Backend Data (C#)`

**Prompt:**

> Crie o adapter `CustomerEfRepository` em C# implementando `ICustomerRepository` com EF Core. Separar `CustomerDbo` da entidade de domínio com mapeamentos `ToDomain` e `FromDomain`.

**Estrutura gerada** (`CustomerEfRepository.cs`):

```csharp
public class CustomerEfRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerEfRepository(AppDbContext context) => _context = context;

    public async Task<Result<Customer>> CreateAsync(Customer customer)
    {
        var dbo = CustomerDbo.FromDomain(customer);
        _context.Customers.Add(dbo);
        await _context.SaveChangesAsync();
        return Result.Success(customer);
    }

    public async Task<Result<Customer?>> FindByIdAsync(Guid id)
    {
        var dbo = await _context.Customers.FindAsync(id);
        return Result.Success(dbo?.ToDomain());
    }
    // ...
}

// Entidade de banco — separada do domínio
public class CustomerDbo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string CPF { get; set; } = "";
    public bool IsActive { get; set; }

    public Customer ToDomain() =>
        Customer.Reconstitute(Id, Name, Email, CPF, IsActive);

    public static CustomerDbo FromDomain(Customer c) => new()
    {
        Id = c.Id, Name = c.Name.Value,
        Email = c.Email.Value, CPF = c.CPF.Value, IsActive = c.IsActive
    };
}
```

---

## Passo 5 — Interface Layer

### Agent: `Backend Controller (C#)`

**Prompt:**

> Crie o `CustomerController` em C# com endpoints POST /api/customers e GET /api/customers/{id}. Usar `CreateCustomerUseCase` e `FindCustomerByIdQuery`.

```csharp
[ApiController]
[Route("api/customers")]
public class CustomerController : ControllerBase
{
    private readonly CreateCustomerUseCase _createUseCase;
    private readonly FindCustomerByIdQuery _findQuery;

    public CustomerController(CreateCustomerUseCase createUseCase, FindCustomerByIdQuery findQuery)
    {
        _createUseCase = createUseCase;
        _findQuery = findQuery;
    }

    [HttpPost]
    public async Task<ActionResult<CustomerOutDto>> Create([FromBody] CreateCustomerInDto dto)
    {
        var result = await _createUseCase.Execute(dto);
        if (result.IsFailure) return BadRequest(result.Errors);
        return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerOutDto>> GetById(Guid id)
    {
        var result = await _findQuery.Execute(id);
        if (result.Value is null) return NotFound();
        return Ok(result.Value);
    }
}
```

---

## Checklist do Módulo

```
Domain Layer
- [ ] VOs criados (Email, CPF, CustomerName) com testes unitários
- [ ] Entity Customer com Create() e métodos de domínio
- [ ] ICustomerRepository (interface) definida

Application Layer
- [ ] DTOs de entrada e saída (records em C#)
- [ ] CreateCustomerUseCase com verificação de duplicata
- [ ] FindCustomerByIdQuery

Infrastructure Layer
- [ ] CustomerDbo separada da entity de domínio
- [ ] Mapeamentos ToDomain() / FromDomain()
- [ ] CustomerEfRepository implementando a interface
- [ ] Migration EF Core criada e aplicada

Interface Layer
- [ ] CustomerController com POST e GET
- [ ] Swagger/OpenAPI documentado
- [ ] Injeção de dependências registrada no Program.cs

Testes
- [ ] **Agent `Unit Tests (C#)`**: testes unitários de Email VO, CPF VO, Customer Entity, CreateCustomerUseCase
- [ ] Coverage ≥95% em Domain + Application (`dotnet test tests/LojaDDD.UnitTests --collect:"XPlat Code Coverage"`)
- [ ] Testes de integração: CustomerEfRepository (opcional, projeto Infrastructure)
- [ ] **Agent `E2E Tests (C#)`**: `CustomerControllerE2ETests` — POST /api/customers → GET /api/customers/{id} em `tests/LojaDDD.IntegrationTests/`
```

---

## Equivalente em Kotlin e TypeScript

Os mesmos prompts funcionam com os sufixos correspondentes:

| Passo | C# | Kotlin | TypeScript |
|-------|----|--------|-----------|
| Bootstrap | `Config Project (C#)` | `Config Project (Kotlin)` | `Config Project` |
| Shared Kernel | `Config Shared Core (C#)` | `Config Shared Core (Kotlin)` | `Config Shared Core` |
| Scaffold módulo | `Config New Module (C#)` | `Config New Module (Kotlin)` | `Config New Module` |
| VO | `Core Value Object (C#)` | `Core Value Object (Kotlin)` | `Core Value Object` |
| Entity | `Core Entity (C#)` | `Core Entity (Kotlin)` | `Core Entity` |
| Repository | `Core Repository (C#)` | `Core Repository (Kotlin)` | `Core Repository` |
| DTO | `Core DTO (C#)` | `Core DTO (Kotlin)` | `Core DTO` |
| Use Case | `Core Use Case (C#)` | `Core Use Case (Kotlin)` | `Core Use Case` |
| Query CQRS | `Core Query CQRS (C#)` | `Core Query CQRS (Kotlin)` | `Core Query CQRS` |
| Persistence | `Backend Data (C#)` | `Backend Data (Kotlin)` | `Backend Prisma Data` |
| Controller | `Backend Controller (C#)` | `Backend Controller (Kotlin)` | `Backend Controller` |
| Unit tests | `Unit Tests (C#)` | `Unit Tests (Kotlin)` | `Unit Tests (TypeScript)` |
| E2E tests | `E2E Tests (C#)` | `E2E Tests (Kotlin)` | `E2E Tests (TypeScript)` |

> [Tutorial 04 — Ciclo OpenSpec](../04-ciclo-completo-openspec.md) — padrão OpenSpec após implementar BCs

> Para criar um projeto completo com frontend, mobile, Docker e CI/CD, escolha uma combinação no [Hub Full-Stack](../02-fullstack-project-setup.md).
