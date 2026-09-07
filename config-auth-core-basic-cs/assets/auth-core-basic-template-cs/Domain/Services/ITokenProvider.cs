namespace Project.Auth.Domain.Services;

public interface ITokenProvider
{
    string Generate(Guid userId, string email, bool isAdmin);
}