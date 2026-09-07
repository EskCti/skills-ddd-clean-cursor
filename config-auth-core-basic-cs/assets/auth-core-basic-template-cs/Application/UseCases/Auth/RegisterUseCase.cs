using Project.Auth.Domain.Entities;
using Project.Auth.Domain.Repositories;
using Project.Auth.Domain.Services;
using Project.Auth.Domain.ValueObjects;
using Project.Shared.Kernel.Domain.Results;
using Project.Shared.Kernel.Domain.ValueObjects;

namespace Project.Auth.Application.UseCases.Auth;

public record RegisterInput(string Name, string Email, string Password, bool IsAdmin = false);

public class RegisterUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUseCase(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<User>> ExecuteAsync(RegisterInput input)
    {
        var nameResult = Name.Create(input.Name);
        var emailResult = Email.Create(input.Email);
        var passwordResult = Password.CreateFromHash(_passwordHasher.Hash(input.Password));

        var combined = Result<User>.Combine(nameResult, emailResult, passwordResult);
        if (combined.IsFailure)
            return Result<User>.Failure(combined.Errors);

        var existingUser = await _userRepository.FindByEmailAsync(emailResult.Value);
        if (existingUser.IsFailure)
            return Result<User>.Failure(existingUser.Errors);

        if (existingUser.Value is not null)
            return Result<User>.Failure("User with this email already exists.");

        var user = User.Create(nameResult.Value, emailResult.Value, passwordResult.Value, input.IsAdmin);
        var saveResult = await _userRepository.SaveAsync(user);
        if (saveResult.IsFailure)
            return Result<User>.Failure(saveResult.Errors);

        return Result<User>.Success(user);
    }
}