namespace ProjectName.Shared.Kernel.Domain.Results;

public class Result
{
    private readonly bool _isSuccess;
    private readonly IReadOnlyList<string> _errors;

    protected Result(bool isSuccess, IEnumerable<string> errors)
    {
        _isSuccess = isSuccess;
        _errors = errors.ToList();
    }

    public bool IsSuccess => _isSuccess;

    public bool IsFailure => !_isSuccess;

    public IReadOnlyList<string> Errors => _errors;

    public static Result Success()
    {
        return new Result(true, new List<string>());
    }

    public static Result Failure(string error)
    {
        var errors = new List<string>();
        errors.Add(error);
        return new Result(false, errors);
    }

    public static Result Failure(IEnumerable<string> errors)
    {
        return new Result(false, errors);
    }

    public static Result Combine(params Result[] results)
    {
        var errors = new List<string>();
        foreach (var result in results)
        {
            if (result.IsFailure)
                errors.AddRange(result.Errors);
        }

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

    public static Result<T> Success(T value)
    {
        return new Result<T>(value, true, new List<string>());
    }

    public static new Result<T> Failure(string error)
    {
        var errors = new List<string>();
        errors.Add(error);
        return new Result<T>(default, false, errors);
    }

    public static new Result<T> Failure(IEnumerable<string> errors)
    {
        return new Result<T>(default, false, errors);
    }

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

    public static Result<T> Bind<T>(this Result result, Func<Result<T>> func)
    {
        return result.IsSuccess ? func() : Result<T>.Failure(result.Errors);
    }

    public static Result<TOut> Bind<TIn, TOut>(this Result<TIn> result, Func<TIn, Result<TOut>> func)
    {
        return result.IsSuccess ? func(result.Value) : Result<TOut>.Failure(result.Errors);
    }

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