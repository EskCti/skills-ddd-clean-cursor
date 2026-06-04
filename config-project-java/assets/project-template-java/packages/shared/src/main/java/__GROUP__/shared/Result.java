package __GROUP__.shared;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class Result<T> {
    private final T value;
    private final List<DomainError> errors;

    private Result(T value, List<DomainError> errors) {
        this.value = value;
        this.errors = List.copyOf(errors);
    }

    public static <T> Result<T> ok(T value) {
        return new Result<>(value, Collections.emptyList());
    }

    public static <T> Result<T> err(DomainError error) {
        return new Result<>(null, List.of(error));
    }

    public static <T> Result<T> err(String message) {
        return err(DomainError.of(message));
    }

    public static <T> Result<T> fail(List<DomainError> errors) {
        if (errors == null || errors.isEmpty()) {
            return err("VALIDATION_ERROR");
        }
        return new Result<>(null, errors);
    }

    public static <T> Result<T> failMessages(List<String> messages) {
        return fail(messages.stream().map(DomainError::of).collect(Collectors.toList()));
    }

    public static Result<Void> combine(Result<?>... results) {
        List<DomainError> merged = Stream.of(results)
                .filter(Result::isFailure)
                .flatMap(r -> r.errors.stream())
                .collect(Collectors.toList());
        if (!merged.isEmpty()) {
            return fail(merged);
        }
        return ok(null);
    }

    public boolean isOk() {
        return errors.isEmpty();
    }

    public boolean isFailure() {
        return !errors.isEmpty();
    }

    public T getOrNull() {
        return value;
    }

    public List<DomainError> getErrors() {
        return errors;
    }

    public List<String> getErrorMessages() {
        return errors.stream().map(DomainError::message).collect(Collectors.toList());
    }

    public <U> Result<U> map(Function<T, U> mapper) {
        if (isFailure()) {
            return fail(errors);
        }
        return ok(mapper.apply(value));
    }

    public static List<DomainError> mergeErrors(Result<?>... results) {
        List<DomainError> merged = new ArrayList<>();
        for (Result<?> result : results) {
            if (result.isFailure()) {
                merged.addAll(result.errors);
            }
        }
        return merged;
    }
}
