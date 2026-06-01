# Java — Layout modular e namespaces (Clean Architecture)

Referência obrigatória para **todos** os skills `-java` de backend.

## Princípio: camadas sim, redundância não

Organize por **Bounded Context** (subprojeto Gradle) e **camada arquitetural**. O tipo principal vive na camada — **não** repita o nome do agregado como subpacote.

| Evitar (redundante) | Usar (profissional) |
|---------------------|---------------------|
| `customers.domain.entity.customer.CustomerEntity` | `customers.domain.entity.Customer` |
| `domain.cliente.Cliente` | `customers.domain.entity.Customer` |
| `CustomerEntity` no domínio | `Customer` no domínio; `CustomerJpaEntity` na infra |
| Port no pacote `infrastructure` | `CustomerRepository` (interface) em `domain.repository` |
| Spring em `packages/<bc>/` | Spring **somente** em `apps/backend-java` |

**Código em inglês** (`Customer`, `Email`). Português só em docs, UI e comentários de negócio quando necessário.

## Workspace Gradle (bootstrap)

```
project-root/
├── settings.gradle
├── build.gradle
├── gradle.properties
├── apps/
│   └── backend-java/          # Spring Boot app (infra + interfaces)
│       └── src/main/java/com/example/
│           ├── Application.java
│           └── modules/
│               ├── health/
│               └── <bc>/      # config-new-module-java
├── packages/
│   ├── shared/                # Result, Entity, UseCase (pure Java)
│   └── <bc>/                  # domain + application (pure Java, NO Spring)
├── docker-compose.yml
└── .env.example
```

## Árvore padrão por Bounded Context

Cada BC é subprojeto `packages/<bc>/` (kebab-case na pasta) + módulo Spring em `apps/backend-java/.../modules/<bc>/`:

```
packages/customers/
└── src/main/java/com/example/customers/
    ├── domain/
    │   ├── entity/Customer.java
    │   ├── valueobject/Email.java
    │   ├── repository/CustomerRepository.java   # interface (port)
    │   └── service/CustomerUniquenessPolicy.java
    └── application/
        ├── dto/CreateCustomerInput.java
        └── usecase/CreateCustomerUseCase.java

apps/backend-java/.../modules/customers/
├── infrastructure/
│   └── persistence/
│       ├── CustomerJpaEntity.java
│       ├── CustomerJpaRepository.java           # Spring Data
│       └── CustomerRepositoryAdapter.java       # implements CustomerRepository
└── interfaces/
    └── web/
        └── CustomerController.java
```

## Paths Java resultantes

```java
// Domínio (packages/customers — pure Java)
com.example.customers.domain.entity.Customer
com.example.customers.domain.valueobject.Email
com.example.customers.domain.repository.CustomerRepository

// Aplicação
com.example.customers.application.usecase.CreateCustomerUseCase
com.example.customers.application.dto.CreateCustomerInput

// Infra (apps/backend-java — Spring)
com.example.modules.customers.infrastructure.persistence.CustomerJpaEntity
com.example.modules.customers.infrastructure.persistence.CustomerRepositoryAdapter

// HTTP
com.example.modules.customers.interfaces.web.CustomerController
```

## Regras de arquivos

| Regra | Detalhe |
|-------|---------|
| Um tipo principal por arquivo | `Customer.java` → `Customer`; `Email.java` → `Email` |
| Pasta BC | kebab-case: `packages/customers/` |
| Pacote BC | lowercase: `com.example.customers` |
| Port (interface) | sempre em `domain.repository`, sufixo `Repository` |
| JPA entity | `CustomerJpaEntity` — **nunca** `Customer` na infra |
| Adapter | `CustomerRepositoryAdapter implements CustomerRepository` |
| DTO | sufixo `Input` / `Output` na camada `application.dto` |
| Controller | thin — delega ao use case; `@RestController` em `interfaces.web` |
| Shared kernel | `com.example.shared` em `packages/shared` — sem Spring |

## Anti-patterns

- Pacote aninhado com mesmo nome do tipo (`entity.customer.Customer`).
- Misturar port e adapter no mesmo arquivo.
- Importar Spring (`@Entity`, `@Service`) dentro de `packages/<bc>/`.
- BC gigante sem subpastas por camada.
- Duplicar entidade de domínio como `CustomerEntity` no domínio.
