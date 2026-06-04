# Shared Kernel — padrões Java

## Result

Failures always carry **`List<DomainError>`** (never a single hidden error). Success has an **empty** error list.

```java
package com.example.shared;

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

    public static <T> Result<T> err(String message) {
        return err(DomainError.of(message));
    }

    public static <T> Result<T> err(DomainError error) {
        return new Result<>(null, List.of(error));
    }

    public static <T> Result<T> fail(List<DomainError> errors) {
        return new Result<>(null, errors);
    }

    public static <T> Result<T> failMessages(List<String> messages) {
        return fail(messages.stream().map(DomainError::of).collect(Collectors.toList()));
    }

    public static List<DomainError> mergeErrors(Result<?>... results) {
        return Stream.of(results)
                .filter(Result::isFailure)
                .flatMap(r -> r.errors.stream())
                .collect(Collectors.toList());
    }

    public boolean isOk() { return errors.isEmpty(); }
    public boolean isFailure() { return !errors.isEmpty(); }
    public T getOrNull() { return value; }
    public List<DomainError> getErrors() { return errors; }
    public List<String> getErrorMessages() {
        return errors.stream().map(DomainError::message).collect(Collectors.toList());
    }

    public <U> Result<U> map(Function<T, U> mapper) {
        if (isFailure()) return fail(errors);
        return ok(mapper.apply(value));
    }
}
```

## Entity combine (example)

```java
var nameResult = Name.tryCreate(props.name());
var emailResult = Email.tryCreate(props.email());
var merged = Result.mergeErrors(nameResult, emailResult);
if (!merged.isEmpty()) {
    return Result.fail(merged);
}
return Result.ok(new Customer(nameResult.getOrNull(), emailResult.getOrNull()));
```

## DomainError

```java
public record DomainError(String code, String message) {
    public static DomainError of(String message) {
        return new DomainError("DOMAIN_ERROR", message);
    }
}
```

## Entity / UseCase

See `Entity.java`, `UseCase.java` in `packages/shared` template.

Import: `com.example.shared.Result` — never duplicate nested packages.
