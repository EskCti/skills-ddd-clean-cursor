namespace Project.Auth.Infrastructure.Identity;

public interface IPasswordHasher
{
    string Hash(string plainText);
    bool Verify(string plainText, string hash);
}

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string plainText)
    {
        return BCrypt.Net.BCrypt.HashPassword(plainText);
    }

    public bool Verify(string plainText, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(plainText, hash);
    }
}
