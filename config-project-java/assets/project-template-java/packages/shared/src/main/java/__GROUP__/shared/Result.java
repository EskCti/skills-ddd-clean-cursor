package __GROUP__.shared;

import java.util.function.Function;

public final class Result<T> {
    private final T value;
    private final DomainError error;

    private Result(T value, DomainError error) {
        this.value = value;
        this.error = error;
    }

    public static <T> Result<T> ok(T value) {
        return new Result<>(value, null);
    }

    public static <T> Result<T> err(DomainError error) {
        return new Result<>(null, error);
    }

    public boolean isOk() {
        return error == null;
    }

    public boolean isFailure() {
        return error != null;
    }

    public T getOrNull() {
        return value;
    }

    public DomainError getError() {
        return error;
    }

    public <U> Result<U> map(Function<T, U> mapper) {
        if (isFailure()) {
            return Result.err(error);
        }
        return Result.ok(mapper.apply(value));
    }
}
