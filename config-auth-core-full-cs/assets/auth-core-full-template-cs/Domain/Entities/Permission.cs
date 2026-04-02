using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Domain.Entities;

public class Permission : Entity
{
    public string Key { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    private Permission() { }

    public static Result<Permission> Create(string key, string description = "")
    {
        if (string.IsNullOrWhiteSpace(key))
            return Result<Permission>.Failure("Permission key is required.");

        if (!key.Contains(':'))
            return Result<Permission>.Failure("Permission key must follow 'resource:action' format (e.g. 'products:create').");

        return Result<Permission>.Success(new Permission
        {
            Id = Guid.NewGuid(),
            Key = key.Trim().ToLowerInvariant(),
            Description = description.Trim()
        });
    }
}
