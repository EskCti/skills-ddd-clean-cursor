using Project.Auth.Domain.Entities;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Domain.Repositories;

public interface IUserRepository
{
    Task<Result<User?>> FindByEmailAsync(string email);
    Task<Result> SaveAsync(User user);
}