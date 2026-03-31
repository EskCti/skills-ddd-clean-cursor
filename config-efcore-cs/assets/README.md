# EF Core Template (C#)

Base configuration and context for Entity Framework Core:

- `Persistence/Contexts/AppDbContext.cs` — Main DbContext with ApplyConfigurationsFromAssembly

The `init-efcore-cs.mjs` script scaffolds this file, adds NuGet packages, and creates the initial `appsettings.json` ConnectionStrings configuration.
