# Template de Tasks OpenSpec para Stack Rust (Axum)

**Propósito**: Exemplos reutilizáveis de tasks OpenSpec para backend Rust + frontend Vue + Flutter.

**Layout**: `config-shared-core-rs/references/rust-namespace-layout.md`  
**Tutorial**: `docs/tutorial/stacks/rust-vue-flutter.md`

---

## BC-001: Customers (Rust + Vue + Flutter)

```markdown
## EP-001: Customers (Axum + Vue + Flutter)

### 0. Scaffold BC
- [ ] `infra:setup` Scaffold módulo customers (~30min)
  - **Agent:** `Config New Module (Rust)`
  - **Prompt:** "Crie módulo customers em crates/api/src/modules/ com camadas domain/application/infrastructure/interfaces. Entity Customer, sem submódulo customer::Customer."

### 1. Domínio Rust — Customers
- [ ] `domain:vo` Email e Cpf (~2h)
  - **Agent:** `Core Value Object (Rust)`
  - **Prompt:** "Crie Email e Cpf em modules/customers/domain/value_objects/. Re-export como domain::Email e domain::Cpf."

- [ ] `domain:entity` Customer (~2h)
  - **Agent:** `Core Entity (Rust)`
  - **Prompt:** "Crie Customer em domain/entity.rs. Aggregate root com create() → Result e métodos de domínio."
  - **Dependencies:** `domain:vo:email`, `domain:vo:cpf`

- [ ] `domain:service` CpfUniquenessPolicy (~1h)
  - **Agent:** `Core Domain Service (Rust)`
  - **Prompt:** "Crie CpfUniquenessPolicy em domain/services/ validando CPF único entre Customer. Sem I/O."
  - **Dependencies:** `domain:entity:customer`, `domain:vo:cpf`

- [ ] `domain:repository` CustomerRepository port (~1h)
  - **Agent:** `Core Repository (Rust)`
  - **Prompt:** "Trait CustomerRepository async em domain/ports/repository.rs. save, find_by_id → Result."

### 2. Aplicação Rust — Customers
- [ ] `app:dto` CreateCustomerInput / CustomerOutput (~1h)
  - **Agent:** `Core DTO (Rust)`
  - **Prompt:** "DTOs em application/dto.rs com serde Input/Output."

- [ ] `app:usecase` CreateCustomer (~2h)
  - **Agent:** `Core Use Case (Rust)`
  - **Prompt:** "CreateCustomer implementando UseCase. Arc<dyn CustomerRepository>. Usar CpfUniquenessPolicy."
  - **Dependencies:** `domain:repository`, `domain:service:cpf-policy`, `app:dto`

- [ ] `app:query` FindCustomerById (~1h)
  - **Agent:** `Core Query CQRS (Rust)`
  - **Prompt:** "Query read-only FindCustomerById em application/find_customer_by_id.rs."

### 3. Infraestrutura Rust — Customers
- [ ] `infra:migration` create_customers (~1h)
  - **Agent:** `Config SQLx (Rust)`
  - **Prompt:** "Migration Postgres para tabela customers. sqlx migrate run."

- [ ] `infra:persistence` CustomerRepositorySqlx (~2h)
  - **Agent:** `Backend Data (Rust)`
  - **Prompt:** "CustomerRepositorySqlx + CustomerRecord separado de domain::Customer."
  - **Dependencies:** `domain:repository`, `infra:migration`

### 4. Interface Rust — Customers
- [ ] `interface:controller` POST/GET customers (~2h)
  - **Agent:** `Backend Controller (Rust)`
  - **Prompt:** "Handlers Axum: POST /customers (201), GET /customers/{id} (404). Delegar use cases."
  - **Dependencies:** `app:usecase`, `app:query`

### 5. Qualidade
- [ ] `test:unit` domain + application (~2h)
  - **Agent:** `Unit Tests (Rust)`
  - **Prompt:** "Mock CustomerRepository. Meta ≥95% domain+application."

- [ ] `test:e2e` POST → GET (~2h)
  - **Agent:** `E2E Tests (Rust)`
  - **Prompt:** "tests/integration: POST /customers → GET /customers/{id}. Postgres via docker-compose."

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
| **Namespace** | `crate::modules::customers::domain::Customer` — nunca `domain::customer::Customer` |

## Referências

- Matriz full-stack: `config-project-fullstack/references/fullstack-stack-matrix.md`
- Tasks C# (formato espelho): `openspec-csharp-task-examples.md`
- Template YAML: `openspec-task-template.yaml`
