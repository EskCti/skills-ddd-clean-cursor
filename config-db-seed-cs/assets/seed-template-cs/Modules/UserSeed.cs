using Microsoft.EntityFrameworkCore;
using Project.Core.Auth.Domain.Entities;
using Project.Core.Auth.Domain.ValueObjects;
using Project.Infrastructure.Persistence.Contexts;
using Project.Infrastructure.Persistence.Models;

namespace Project.Infrastructure.Persistence.Seed.Modules;

public static class UserSeed
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        Console.WriteLine("Seeding Users...");

        var user = User.Create(
            Name.Create("Admin").Value,
            Email.Create("admin@example.com").Value,
            true
        );

        if (!user.IsSuccess)
        {
            Console.WriteLine($"Skipping user seed: {string.Join(", ", user.Errors)}");
            return;
        }

        var userRow = new UserDbo
        {
            Id = user.Value.Id,
            Name = user.Value.Name.Value,
            Email = user.Value.Email.Value,
            IsAdmin = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Users.AddAsync(userRow;
        await context.SaveChangesAsync();
    }
}