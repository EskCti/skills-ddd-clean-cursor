# Seed Pattern (C# / EF Core)

## Convenções

1. **Idempotência**: Sempre verifique se o registro existe (`_context.Set<T>().Any(x => x.Id == id)`) antes de tentar inserir.
2. **Contexto**: Use o `AppDbContext` para persistência.
3. **Módulos**: Um arquivo de seed por módulo de domínio (`AuthSeed`, `CatalogSeed`, etc.).
4. **Log**: Forneça feedback no console sobre o progresso do seeding.

## Checklist

- [ ] Criar classe de seed para o módulo alvo.
- [ ] Implementar método `SeedAsync(AppDbContext context)`.
- [ ] Chamar o seed do módulo no `DataSeeder` principal.
- [ ] Validar a inserção bem-sucedida consultando o banco.

## Exemplo de Seed de Módulo

```csharp
public static class UserSeed
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

var user = User.Create(
            Name.Create("Admin").Value,
            Email.Create("admin@example.com").Value,
            true
        );

        // Mapear entidade de domínio → Dbo (EF Core mapeia o Dbo à tabela;
        // nunca persiste a entidade de domínio direto no DbSet)
        var userRow = new UserRow
        {
            Id = user.Id,
            Name = user.Name.Value,
            Email = user.Email.Value,
            IsAdmin = true
        };
        await context.Users.AddAsync(userRow;
        await context.SaveChangesAsync();
    }
}
```

## Armadilhas comuns

- Esquecer o `SaveChangesAsync()`.
- Criar dados duplicados por falta de checagem de existência.
- Executar seeds pesados em Produção (use `app.Environment.IsDevelopment()`).
- Tentar inserir dados com GUIDs fixos que colidem com migrações ou seeds anteriores..
- ❌ Persistir a **entidade de domínio** direto no `DbSet` — mapear para Dbo (`UserRow`) antes de `AddAsync` (mantém o ORM fora do domínio).

## NÃO FAZER

- Seed criando dados com chaves primárias fixas sem checar colisões em ambientes compartilhados..
- Rodar seeds pesados em produção (use `app.Environment.IsDevelopment()`).
