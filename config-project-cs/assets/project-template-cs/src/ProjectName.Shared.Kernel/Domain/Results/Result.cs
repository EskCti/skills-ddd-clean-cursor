namespace ProjectName.Shared.Kernel.Domain.Results;

public class Result
{
    public bool IsSuccess { get; init; }
    public bool IsFailure => !IsSuccess;
    public IReadOnlyList<string> Errors { get; init; } = [];

    public static Result Success() => new() { IsSuccess = true };

    public static Result Failure(string error) =>
        new() { IsSuccess = false, Errors = [error] };

    public static Result Failure(IEnumerable<string> errors) =>
        new() { IsSuccess = false, Errors = errors.ToList() };

    public static Result Combine(params Result[] results)
    {
        var errors = results.Where(r => r.IsFailure).SelectMany(r => r.Errors).ToList();
        return errors.Count > 0 ? Failure(errors) : Success();
    }
}

public class Result<T> : Result
{
    public T? Value { get; init; }

    public static Result<T> Success(T value) =>
        new() { IsSuccess = true, Value = value };

    public static new Result<T> Failure(string error) =>
        new() { IsSuccess = false, Errors = [error] };

    public static new Result<T> Failure(IEnumerable<string> errors) =>
        new() { IsSuccess = false, Errors = errors.ToList() };

    public static Result<(T1, T2)> Combine<T1, T2>(Result<T1> first, Result<T2> second)
    {
        var errors = new List<string>();
        if (first.IsFailure) errors.AddRange(first.Errors);
        if (second.IsFailure) errors.AddRange(second.Errors);
        if (errors.Count > 0)
            return Result<(T1, T2)>.Failure(errors);
        return Result<(T1, T2)>.Success((first.Value!, second.Value!));
    }

    public static Result<(T1, T2, T3)> Combine<T1, T2, T3>(
        Result<T1> first,
        Result<T2> second,
        Result<T3> third)
    {
        var errors = new List<string>();
        if (first.IsFailure) errors.AddRange(first.Errors);
        if (second.IsFailure) errors.AddRange(second.Errors);
        if (third.IsFailure) errors.AddRange(third.Errors);
        if (errors.Count > 0)
            return Result<(T1, T2, T3)>.Failure(errors);
        return Result<(T1, T2, T3)>.Success((first.Value!, second.Value!, third.Value!));
    }
}
