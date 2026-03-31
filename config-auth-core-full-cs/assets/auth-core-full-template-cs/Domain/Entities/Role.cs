using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Domain.Entities;

public class Role : Entity
{
    public string Name { get; private set; } = string.Empty;
    private readonly List<Permission> _permissions = new();
    public IReadOnlyCollection<Permission> Permissions => _permissions.AsReadOnly();

    private Role() { }

    public static Result<Role> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Role>.Failure("Role name is required.");

        return Result<Role>.Success(new Role { Id = Guid.NewGuid(), Name = name.Trim() });
    }

    public Result AddPermission(Permission permission)
    {
        if (_permissions.Any(p => p.Key == permission.Key))
            return Result.Failure($"Permission '{permission.Key}' already assigned.");

        _permissions.Add(permission);
        return Result.Success();
    }

    public void RemovePermission(string permissionKey)
    {
        _permissions.RemoveAll(p => p.Key == permissionKey);
    }

    public bool HasPermission(string permissionKey)
    {
        return _permissions.Any(p => p.Key == permissionKey);
    }
}
