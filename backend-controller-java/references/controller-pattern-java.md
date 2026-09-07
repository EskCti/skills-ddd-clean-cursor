# Controller Pattern (Java / Spring Boot)

## Paths de referência

- `apps/backend-java/.../modules/<bc>/interfaces/web/CustomerController.java`
- `apps/backend-java/.../modules/<bc>/CustomerModuleConfig.java` (wiring dos use cases)
- Shared kernel: `packages/shared/.../Result.java` e `DomainError.java`

## Papel do controller

- Converter a requisição HTTP (DTO de entrada) em input para o use case.
- Delegar ao use case da camada `application`; não executar regra de domínio.
- Mapear `Result` do domínio/aplicação para `ResponseEntity` com envelope de erro §5.1.

## Checklist de implementação

- [ ] `@RestController` + `@RequestMapping` base por BC (`/customers`, `/orders`).
- [ ] Verbo HTTP correto (`@PostMapping`, `@GetMapping`, `@PutMapping`, `@DeleteMapping`).
- [ ] Injeção via construtor (use cases/queries do `application`); sem `@Autowired` em campo.
- [ ] Entrada com `@RequestBody` / `@PathVariable` / `@RequestParam`.
- [ ] Saída via DTO — nunca devolver a entidade de domínio.
- [ ] `Result.isFailure()` → `400 { "errors": [...] }` com **lista completa** via `getErrorMessages()`.
- [ ] Create → `201 Created`; leitura → `200 OK`; não encontrado → `404`.
- [ ] Exceção inesperada → `500 { "errors": [...] }`.

## Mapeamento Result → HTTP

| Estado do `Result` | HTTP |
|---|---|
| `isFailure()` (validação/regra de negócio) | `400` com `{ "errors": getErrorMessages() }` |
| `isOk()` no create | `201 Created` + DTO de saída |
| `isOk()` no find/list | `200 OK` + DTO de saída |
| Busca sem resultado (`Optional.empty()`) | `404` (sem body ou com `{ "errors": [...] }`) |
| Exceção não capturada | `500` com `{ "errors": [...] }` |

## Exemplo completo

```java
package com.example.modules.customers.interfaces.web;

import com.example.customers.application.dto.CreateCustomerInput;
import com.example.customers.application.dto.CreateCustomerOutput;
import com.example.customers.application.dto.CustomerOutput;
import com.example.customers.application.usecase.CreateCustomerUseCase;
import com.example.customers.application.usecase.FindCustomerByIdQuery;
import com.example.shared.Result;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CreateCustomerUseCase createCustomerUseCase;
    private final FindCustomerByIdQuery findCustomerByIdQuery;

    public CustomerController(CreateCustomerUseCase createCustomerUseCase,
                              FindCustomerByIdQuery findCustomerByIdQuery) {
        this.createCustomerUseCase = createCustomerUseCase;
        this.findCustomerByIdQuery = findCustomerByIdQuery;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateCustomerInput input) {
        Result<CreateCustomerOutput> result = createCustomerUseCase.execute(input);
        if (result.isFailure()) {
            return ResponseEntity.badRequest().body(errorBody(result));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.getOrNull());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable UUID id) {
        Result<java.util.Optional<CustomerOutput>> result = findCustomerByIdQuery.execute(id);
        if (result.isFailure()) {
            return ResponseEntity.badRequest().body(errorBody(result));
        }
        return result.getOrNull()
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static Map<String, List<String>> errorBody(Result<?> result) {
        return Map.of("errors", result.getErrorMessages());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, List<String>>> handleUnexpected(Exception ex) {
        String message = ex.getMessage() == null ? "internal error" : ex.getMessage();
        return ResponseEntity.internalServerError().body(Map.of("errors", List.of(message)));
    }
}
```

## Exemplo de erro (400)

```json
{
  "errors": [
    "MONEY_AMOUNT_INVALID: amount must be greater than zero",
    "CPF_INVALID: cpf must have 11 digits"
  ]
}
```

## Armadilhas comuns

- Devolver a entidade de domínio no corpo da resposta — usar sempre DTO `*Output`.
- Retornar `200 OK` no create — usar `201 Created` (`HttpStatus.CREATED`).
- `badRequest().build()` sem corpo — devolver `{ "errors": [...] }` com a lista completa.
- Colapsar a lista em `errors[0]` ou `message` única — preservar todos os erros do `Result`.
- Colocar regra de negócio ou acesso a banco no controller.

## References

- `../skills-standards.md` § **5.1 Result and validation errors** e § **10 Java Stack Standards**.
- `../config-shared-core-java/references/shared-patterns-java.md` — API do `Result<T>` (`getErrors()`, `getErrorMessages()`).