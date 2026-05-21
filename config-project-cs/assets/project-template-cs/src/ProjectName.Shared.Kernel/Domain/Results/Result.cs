namespace ProjectName.Shared.Kernel.Domain.Results;

public class Result
{
    public bool IsSuccess { get; init; }
    public bool IsFailure => !IsSuccess;
    public IReadOnlyList<string> Errors { get; init; } = [];

    public static Result Success() => new() { IsSuccess = true };

    public static Result Failure(string error) =>
        new() { IsSuccess = false, Errors = [error] };
}
