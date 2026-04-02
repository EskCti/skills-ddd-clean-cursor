using Microsoft.EntityFrameworkCore;
using Project.Infrastructure.Persistence.Contexts;

namespace Project.Infrastructure.Persistence.Seed.Modules;

public static class UserSeed
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        Console.WriteLine("Seeding Users...");

        // TODO: replace with actual entity creation
        // var user = User.Create(Name.Create("Admin").Value, Email.Create("admin@example.com").Value, true);
        // await context.Users.AddAsync(user);
        // await context.SaveChangesAsync();
    }
}
