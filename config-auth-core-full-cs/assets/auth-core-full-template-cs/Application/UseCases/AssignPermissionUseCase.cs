using Project.Auth.Domain.Entities;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Application.UseCases;

public record AssignPermissionInput(Guid RoleId, string PermissionKey, string Description = "");

public class AssignPermissionUseCase
{
    private readonly IRoleRepository _roleRepository;

    public AssignPermissionUseCase(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<Result> ExecuteAsync(AssignPermissionInput input)
    {
        var role = await _roleRepository.FindByNameAsync(input.RoleId.ToString());
        if (role is null)
            return Result.Failure("Role not found.");

        var permissionResult = Permission.Create(input.PermissionKey, input.Description);
        if (!permissionResult.IsSuccess)
            return Result.Failure(permissionResult.Error!);

        var addResult = role.AddPermission(permissionResult.Value!);
        if (!addResult.IsSuccess)
            return addResult;

        await _roleRepository.SaveAsync(role);
        return Result.Success();
    }
}
