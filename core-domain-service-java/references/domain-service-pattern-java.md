# Domain Service — Java

```java
package com.example.orders.domain.service;

import com.example.orders.domain.entity.Order;
import com.example.shared.Result;

public final class OrderTotalCalculator {

    private OrderTotalCalculator() {}

    public static Result<Money> calculate(Order order) {
        // pure domain logic — no Spring, no repository calls
        return Result.ok(order.subtotal());
    }
}
```

Use cases injetam o serviço via construtor (classe plain Java) ou chamam métodos estáticos.
