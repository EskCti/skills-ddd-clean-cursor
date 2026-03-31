using Project.Shared.Kernel.Application.UseCases;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Application.UseCases;

public record LoginInput(string Email, string Password);
public record LoginOutput(string Token, Guid UserId);

public class LoginUseCase : IUseCase<LoginInput, LoginOutput>
{
    public async Task<Result<LoginOutput>> Execute(LoginInput input)
    {
        // Implement logic here
        return Result<LoginOutput>.Failure("Not implemented");
    }
}
