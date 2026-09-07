using Project.Auth.Domain.ValueObjects;
using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.ValueObjects;

namespace Project.Auth.Domain.Entities;

public class User : Entity
{
    public Name Name { get; private set; }
    public Email Email { get; private set; }
    public Password Password { get; private set; }
    public bool IsAdmin { get; private set; }

    private User(Name name, Email email, Password password, bool isAdmin = false)
    {
        Name = name;
        Email = email;
        Password = password;
        IsAdmin = isAdmin;
    }

    public static User Create(Name name, Email email, Password password, bool isAdmin = false)
    {
        return new User(name, email, password, isAdmin);
    }
}
