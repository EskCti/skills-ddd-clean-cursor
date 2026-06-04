# Entity — Java

Path: `packages/<bc>/.../domain/entity/Customer.java`

Failures: `Result.fail(List<DomainError>)` or `Result.failMessages(List<String>)`. Success: empty error list.

```java
public static Result<Customer> create(String rawName, String rawEmail) {
    var nameResult = Name.tryCreate(rawName);
    var emailResult = Email.tryCreate(rawEmail);

    var merged = Result.mergeErrors(nameResult, emailResult);
    if (!merged.isEmpty()) {
        return Result.fail(merged);
    }

    return Result.ok(new Customer(
        Id.generate(),
        nameResult.getOrNull(),
        emailResult.getOrNull()));
}
```

Import: `com.example.customers.domain.entity.Customer`

Persistência: `CustomerJpaEntity` em `apps/backend-java` — skill `backend-data-java`.
