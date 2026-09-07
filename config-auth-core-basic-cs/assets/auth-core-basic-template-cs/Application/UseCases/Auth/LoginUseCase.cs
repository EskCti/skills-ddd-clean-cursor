using Project.Auth.Domain.Entities;
using Project.Auth.Domain.Repositories;
using Project.Auth.Domain.Services;
using Project.Shared.Kernel.Application.UseCases;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Application.UseCases.Auth;

public record LoginInput(string Email, string Password);

public record LoginOutput(string Token, Guid UserId);

public class LoginUseCase : IUseCase<LoginInput, LoginOutput>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenProvider _tokenProvider;

    public LoginUseCase(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenProvider tokenProvider)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenProvider = tokenProvider;
    }

    public async Task<Result<LoginOutput>> Execute(LoginInput input)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(input.Email))
            errors.Add("Email is required.");
        if (string.IsNullOrWhiteSpace(input.Password))
            errors.Add("Password is required.");

        if (errors.Count > 0)
            return Result<LoginOutput>.Failure(errors);

        var userResult = await _userRepository.FindByEmailAsync(input.Email);
        if (userResult.IsFailure)
            return Result<LoginOutput>.Failure(userResult.Errors);

        var user = userResult.Value;
        if (user is null || !_passwordHasher.Verify(input.Password, user.Password.Hash))
            return Result<LoginOutput>.Failure("Invalid email or password.");

        var token = _tokenProvider.Generate(user.Id, user.Email.Value, user.IsAdmin);
        return Result<LoginOutput>.Success(new LoginOutput(token, user.Id));
    }
}