# Entity — Java

```java
// packages/customers/.../domain/entity/Customer.java
package com.example.customers.domain.entity;

import com.example.shared.DomainError;
import com.example.shared.Entity;
import com.example.shared.Result;
import com.example.customers.domain.valueobject.Email;
import java.util.UUID;

public class Customer implements Entity<UUID> {
    private final UUID id;
    private final Email email;
    private boolean active;

    private Customer(UUID id, Email email, boolean active) {
        this.id = id;
        this.email = email;
        this.active = active;
    }

    @Override
    public UUID id() {
        return id;
    }

    public static Result<Customer> create(UUID id, Email email) {
        return Result.ok(new Customer(id, email, true));
    }

    public Result<Void> deactivate() {
        if (!active) {
            return Result.err(DomainError.of("already inactive"));
        }
        active = false;
        return Result.ok(null);
    }
}
```

Import externo: `com.example.customers.domain.entity.Customer`

Persistência: `CustomerJpaEntity` em `modules.customers.infrastructure.persistence` — skill `backend-data-java`.
