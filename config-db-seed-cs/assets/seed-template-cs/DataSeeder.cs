using Microsoft.EntityFrameworkCore;
using Project.Infrastructure.Persistence.Contexts;
using Project.Infrastructure.Persistence.Seed.Modules;

namespace Project.Infrastructure.Persistence.Seed;

public class DataSeeder
{
    private readonly AppDbContext _context;

    public DataSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAllAsync()
    {
        Console.WriteLine("Starting Database Seeding...");

        try
        {
            await UserSeed.SeedAsync(_context);

            Console.WriteLine("Database Seeding completed successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during seeding: {ex.Message}");
            throw;
        }
    }
}
