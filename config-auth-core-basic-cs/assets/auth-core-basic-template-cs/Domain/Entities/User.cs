using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.ValueObjects;

namespace Project.Auth.Domain.Entities;

public class User : Entity
{
    public Name Name { get; private set; }
    public Email Email { get; private set; }
    public bool IsAdmin { get; private set; }

    private User(Name name, Email email, bool isAdmin = false)
    {
        Name = name;
        Email = email;
        IsAdmin = isAdmin;
    }

    public static User Create(Name name, Email email, bool isAdmin = false)
    {
        return new User(name, email, isAdmin);
    }
}
