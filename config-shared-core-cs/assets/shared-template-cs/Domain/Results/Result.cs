namespace Project.Shared.Kernel.Domain.Results;

public class Result
{
    protected Result(bool isSuccess, IEnumerable<string> errors)
    {
        IsSuccess = isSuccess;
        Errors = errors.ToList();
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public IReadOnlyList<string> Errors { get; }

    public static Result Success() => new(true, Array.Empty<string>());
    public static Result Failure(string error) => new(false, new[] { error });
    public static Result Failure(IEnumerable<string> errors) => new(false, errors);

    public static Result Combine(params Result[] results)
    {
        var errors = results.Where(r => r.IsFailure).SelectMany(r => r.Errors).ToList();
        return errors.Count > 0 ? Failure(errors) : Success();
    }
}

public class Result<T> : Result
{
    private readonly T? _value;

    protected internal Result(T? value, bool isSuccess, IEnumerable<string> errors)
        : base(isSuccess, errors)
    {
        _value = value;
    }

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("The value of a failure result cannot be accessed.");

    public static Result<T> Success(T value) => new(value, true, Array.Empty<string>());
    public static new Result<T> Failure(string error) => new(default, false, new[] { error });
    public static new Result<T> Failure(IEnumerable<string> errors) => new(default, false, errors);

    public static Result<(T1, T2)> Combine<T1, T2>(Result<T1> first, Result<T2> second)
    {
        var errors = new List<string>();
        if (first.IsFailure) errors.AddRange(first.Errors);
        if (second.IsFailure) errors.AddRange(second.Errors);
        if (errors.Count > 0)
            return Result<(T1, T2)>.Failure(errors);
        return Result<(T1, T2)>.Success((first.Value, second.Value));
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
        return Result<(T1, T2, T3)>.Success((first.Value, second.Value, third.Value));
    }
}

public static class ResultExtensions
{
    public static Result<T> ToResult<T>(this T value) => Result<T>.Success(value);

    public static Result<T> ToFailureResult<T>(this string error) => Result<T>.Failure(error);

    public static Result<T> ToFailureResult<T>(this IEnumerable<string> errors) => Result<T>.Failure(errors);

    public static Result<T> Bind<T>(this Result result, Func<Result<T>> func) =>
        result.IsSuccess ? func() : Result<T>.Failure(result.Errors);

    public static Result<TOut> Bind<TIn, TOut>(this Result<TIn> result, Func<TIn, Result<TOut>> func) =>
        result.IsSuccess ? func(result.Value) : Result<TOut>.Failure(result.Errors);

    public static Result<T> OnSuccess<T>(this Result<T> result, Action<T> action)
    {
        if (result.IsSuccess)
            action(result.Value);
        return result;
    }

    public static Result<T> OnFailure<T>(this Result<T> result, Action<IReadOnlyList<string>> action)
    {
        if (result.IsFailure)
            action(result.Errors);
        return result;
    }
}
