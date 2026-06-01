# Template de Tasks OpenSpec para Stack Java (Spring Boot)

**Propósito**: Exemplos reutilizáveis de tasks OpenSpec para backend Java + frontend Vue + Flutter.

**Layout**: `config-shared-core-java/references/java-namespace-layout.md`  
**Tutorial**: `docs/tutorial/stacks/java-vue-flutter.md`

---

## BC-001: Customers (Java + Vue + Flutter)

```markdown
## EP-001: Customers (Spring Boot Java + Vue + Flutter)

### 0. Scaffold BC
- [ ] `infra:setup` Scaffold módulo customers (~30min)
  - **Agent:** `Config New Module (Java)`
  - **Prompt:** "Crie módulo customers em packages/customers/ (domain + application) e apps/backend-java/modules/customers/ (JPA + controller). Entity Customer, sem subpacote customer::Customer."

### 1. Domínio Java — Customers
- [ ] `domain:vo` Email e Cpf (~2h)
  - **Agent:** `Core Value Object (Java)`
  - **Prompt:** "Crie Email e Cpf em packages/customers/.../domain/valueobject/. Validação no construtor, imutáveis."

- [ ] `domain:entity` Customer (~2h)
  - **Agent:** `Core Entity (Java)`
  - **Prompt:** "Crie Customer em domain/entity/Customer.java. Aggregate root com factory create() → Result e métodos de domínio."
  - **Dependencies:** `domain:vo:email`, `domain:vo:cpf`

- [ ] `domain:service` CpfUniquenessPolicy (~1h)
  - **Agent:** `Core Domain Service (Java)`
  - **Prompt:** "Crie CpfUniquenessPolicy em domain/service/ validando CPF único entre Customer. Sem I/O."
  - **Dependencies:** `domain:entity:customer`, `domain:vo:cpf`

- [ ] `domain:repository` CustomerRepository port (~1h)
  - **Agent:** `Core Repository (Java)`
  - **Prompt:** "Interface CustomerRepository em domain/repository/. save, findById → Result. Pure Java, sem Spring."

### 2. Aplicação Java — Customers
- [ ] `app:dto` CreateCustomerInput / CustomerOutput (~1h)
  - **Agent:** `Core DTO (Java)`
  - **Prompt:** "DTOs em application/dto/ com records ou classes imutáveis."

- [ ] `app:usecase` CreateCustomer (~2h)
  - **Agent:** `Core Use Case (Java)`
  - **Prompt:** "CreateCustomerUseCase implementando UseCase. Injetar CustomerRepository via construtor. Usar CpfUniquenessPolicy."
  - **Dependencies:** `domain:repository`, `domain:service:cpf-policy`, `app:dto`

- [ ] `app:query` FindCustomerById (~1h)
  - **Agent:** `Core Query CQRS (Java)`
  - **Prompt:** "Query read-only FindCustomerById em application/query/."

### 3. Infraestrutura Java — Customers
- [ ] `infra:migration` create_customers (~1h)
  - **Agent:** `Config JPA (Java)`
  - **Prompt:** "Migration Flyway V001__create_customers.sql para tabela customers."

- [ ] `infra:persistence` CustomerRepositoryAdapter (~2h)
  - **Agent:** `Backend Data (Java)`
  - **Prompt:** "CustomerJpaEntity + CustomerJpaRepository (Spring Data) + CustomerRepositoryAdapter implements CustomerRepository. JpaEntity separado de domain.entity.Customer."
  - **Dependencies:** `domain:repository`, `infra:migration`

### 4. Interface Java — Customers
- [ ] `interface:controller` POST/GET customers (~2h)
  - **Agent:** `Backend Controller (Java)`
  - **Prompt:** "@RestController: POST /customers (201), GET /customers/{id} (404). Delegar use cases."
  - **Dependencies:** `app:usecase`, `app:query`

### 5. Qualidade
- [ ] `test:unit` domain + application (~2h)
  - **Agent:** `Unit Tests (Java)`
  - **Prompt:** "JUnit 5 + Mockito. Mock CustomerRepository. Meta JaCoCo ≥95% domain+application."

- [ ] `test:e2e` POST → GET (~2h)
  - **Agent:** `E2E Tests (Java)`
  - **Prompt:** "MockMvc: POST /customers → GET /customers/{id}. @SpringBootTest + Postgres via docker-compose."

### 6. Frontend Vue — Customers
- [ ] `interface:entity` Customer Vue (~1h)
  - **Agent:** `Frontend Entity (Vue)`
  - **Prompt:** "Customer + Result<T> TypeScript puro."

- [ ] `interface:usecase` CreateCustomerUseCase Vue (~1h)
  - **Agent:** `Frontend UseCase (Vue)`

- [ ] `interface:repository` CustomerHttpRepository (~1h)
  - **Agent:** `Frontend Repository (Vue)`
  - **Prompt:** "HTTP para http://localhost:4000/customers (proxy Vite /api)."

- [ ] `interface:page` CustomerListView (~2h)
  - **Agent:** `Frontend Page (Vue)`

### 7. Mobile Flutter — Customers
- [ ] `interface:mobile-entity` Customer Flutter (~1h)
  - **Agent:** `Mobile Entity (Flutter)`

- [ ] `interface:mobile-usecase` CreateCustomerUseCase (~1h)
  - **Agent:** `Mobile UseCase (Flutter)`

- [ ] `interface:mobile-repository` Dio → :4000 (~1h)
  - **Agent:** `Mobile Repository (Flutter)`

- [ ] `interface:mobile` CustomerListPage (~2h)
  - **Agent:** `Mobile Screen (Flutter)`
```

---

## Convenções

| Campo | Regra |
|-------|-------|
| **Agent** | Sempre `display_name` do `agents/openai.yaml` |
| **Dependencies** | Opcional — alinhar com `openspec-validate-dependencies` |
| **Specs** | Links para specs OpenSpec quando existirem |
| **Namespace** | `com.example.customers.domain.entity.Customer` — nunca `domain.customer.CustomerEntity` no domínio |
| **Spring** | Somente em `apps/backend-java/` — nunca em `packages/` |

## Referências

- [java-namespace-layout.md](../../config-shared-core-java/references/java-namespace-layout.md)
- [java-vue-flutter.md](../tutorial/stacks/java-vue-flutter.md)
- [openspec-kotlin-task-examples.md](./openspec-kotlin-task-examples.md) — referência JVM alternativa
