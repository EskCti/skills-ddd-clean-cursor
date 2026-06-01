# Shared Kernel — padrões Java

## Result

```java
package com.example.shared;

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

    public boolean isOk() { return error == null; }
    public boolean isFailure() { return error != null; }
    public T getOrNull() { return value; }
    public DomainError getError() { return error; }

    public <U> Result<U> map(java.util.function.Function<T, U> mapper) {
        if (isFailure()) return Result.err(error);
        return Result.ok(mapper.apply(value));
    }
}
```

## DomainError

```java
package com.example.shared;

public record DomainError(String code, String message) {
    public static DomainError of(String message) {
        return new DomainError("DOMAIN_ERROR", message);
    }
}
```

## Entity

```java
package com.example.shared;

public interface Entity<ID> {
    ID id();
}
```

## UseCase

```java
package com.example.shared;

public interface UseCase<I, O> {
    Result<O> execute(I input);
}
```

Import nos módulos de BC:

```java
import com.example.shared.Result;
import com.example.shared.Entity;
import com.example.shared.UseCase;
import com.example.shared.DomainError;
```

Nunca `com.example.shared.entity.entity.Entity`.
