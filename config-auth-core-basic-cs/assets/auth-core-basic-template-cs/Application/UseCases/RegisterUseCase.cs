using Project.Auth.Domain.Entities;
using Project.Auth.Domain.ValueObjects;
using Project.Shared.Kernel.Domain.Results;
using Project.Shared.Kernel.Domain.ValueObjects;

namespace Project.Auth.Application.UseCases;

public record RegisterInput(string Name, string Email, string Password, bool IsAdmin = false);

public class RegisterUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly Func<string, string> _hashPassword;

    public RegisterUseCase(IUserRepository userRepository, Func<string, string> hashPassword)
    {
        _userRepository = userRepository;
        _hashPassword = hashPassword;
    }

    public async Task<Result<User>> ExecuteAsync(RegisterInput input)
    {
        var existingUser = await _userRepository.FindByEmailAsync(input.Email);
        if (existingUser is not null)
            return Result<User>.Failure("User with this email already exists.");

        var nameResult = Name.Create(input.Name);
        if (!nameResult.IsSuccess)
            return Result<User>.Failure(nameResult.Error!);

        var emailResult = Email.Create(input.Email);
        if (!emailResult.IsSuccess)
            return Result<User>.Failure(emailResult.Error!);

        var hash = _hashPassword(input.Password);
        var passwordResult = Password.CreateFromHash(hash);
        if (!passwordResult.IsSuccess)
            return Result<User>.Failure(passwordResult.Error!);

        var user = User.Create(nameResult.Value!, emailResult.Value!, input.IsAdmin);
        await _userRepository.SaveAsync(user);

        return Result<User>.Success(user);
    }
}

public interface IUserRepository
{
    Task<User?> FindByEmailAsync(string email);
    Task SaveAsync(User user);
}
