# EF Core Initialization Checklist (C#)

## 1. Dependências (Infrastructure)

- [ ] Verificar `Microsoft.EntityFrameworkCore`.
- [ ] Verificar `Npgsql.EntityFrameworkCore.PostgreSQL` (provider Postgres).
- [ ] Instalar o CLI `dotnet-ef`: `dotnet tool install --global dotnet-ef`.

## 2. DbContext Setup

- [ ] Criar `AppDbContext.cs`.
- [ ] Sobrescrever `OnModelCreating` para aplicar configurações automaticamente:
  ```csharp
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
      modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
      base.OnModelCreating(modelBuilder);
  }
  ```

## 3. Injeção de Dependência (Backend)

- [ ] Registrar no `Program.cs`:
  ```csharp
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
  ```

## 4. Variáveis de Ambiente

- [ ] `.env`: `DATABASE_URL=Host=localhost;Database=appdb;Username=postgres;Password=postgres`
- [ ] `appsettings.json`: Referenciar a ConnectionString.

## 5. Primeira Migration

- [ ] Executar o comando `dotnet ef migrations add InitialBootstrap`.
- [ ] Verificar se os arquivos foram gerados na pasta correta.
