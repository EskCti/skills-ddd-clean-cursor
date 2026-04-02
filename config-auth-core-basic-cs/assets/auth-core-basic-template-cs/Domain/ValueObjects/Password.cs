using Project.Shared.Kernel.Domain.Results;

namespace Project.Auth.Domain.ValueObjects;

public record Password
{
    public string Hash { get; }

    private Password(string hash) => Hash = hash;

    public static Result<Password> CreateFromHash(string hash)
    {
        if (string.IsNullOrWhiteSpace(hash))
            return Result<Password>.Failure("Hash is required");

        return Result<Password>.Success(new Password(hash));
    }

    public bool Verify(string plainText, Func<string, string, bool> verifier)
    {
        return verifier(plainText, Hash);
    }
}
