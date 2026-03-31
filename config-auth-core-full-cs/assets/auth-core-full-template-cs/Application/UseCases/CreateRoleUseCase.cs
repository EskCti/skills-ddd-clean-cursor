using Project.Auth.Domain.Entities;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Application.UseCases;

public record CreateRoleInput(string Name);

public class CreateRoleUseCase
{
    private readonly IRoleRepository _roleRepository;

    public CreateRoleUseCase(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<Result<Role>> ExecuteAsync(CreateRoleInput input)
    {
        var existingRole = await _roleRepository.FindByNameAsync(input.Name);
        if (existingRole is not null)
            return Result<Role>.Failure($"Role '{input.Name}' already exists.");

        var roleResult = Role.Create(input.Name);
        if (!roleResult.IsSuccess)
            return roleResult;

        await _roleRepository.SaveAsync(roleResult.Value!);
        return roleResult;
    }
}

public interface IRoleRepository
{
    Task<Role?> FindByNameAsync(string name);
    Task SaveAsync(Role role);
}
