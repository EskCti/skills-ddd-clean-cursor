# Leptos Frontend — Namespace Layout

## Goal

Organizar o crate `web-leptos` com Clean Architecture: domínio e aplicação puros (sem `leptos::*`), infraestrutura HTTP, apresentação em componentes Leptos.

## Estrutura por Bounded Context

```
crates/web-leptos/src/features/<bc>/
├── mod.rs
├── domain/
│   ├── mod.rs
│   ├── entity.rs           # entidade + validações → Result
│   └── ports.rs            # trait <Bc>Repository
├── application/
│   ├── mod.rs
│   └── <use_case>.rs       # struct <UseCase> + execute()
├── infrastructure/
│   ├── mod.rs
│   ├── dto.rs              # serde structs da API
│   └── http_repository.rs  # impl trait Repository
└── presentation/
    ├── mod.rs
    ├── list_page.rs        # #[component] ListPage
    └── form_page.rs        # #[component] FormPage
```

## Regras de import

| Camada | Pode importar | Não pode importar |
|--------|---------------|-------------------|
| `domain` | `shared_kernel::Result`, std | `leptos`, `reqwest`, `serde` (DTO) |
| `application` | `domain`, `shared_kernel` | `leptos`, `reqwest` |
| `infrastructure` | `domain`, `reqwest`, `serde` | `leptos` |
| `presentation` | `application`, `domain`, `leptos`, `leptos_router` | `reqwest` direto (usar use case) |

## Exemplos de paths

```
✅ crate::features::customers::domain::Customer
✅ crate::features::customers::domain::ports::CustomerRepository
✅ crate::features::customers::application::CreateCustomer
✅ crate::features::customers::infrastructure::CustomerHttpRepository
✅ crate::features::customers::presentation::CustomerListPage

❌ crate::features::customers::domain::customer::Customer
❌ fetch direto em presentation/list_page.rs
```

## Result type

Reutilizar `shared_kernel::Result<T>` do workspace — mesma semântica do backend (`Err(Vec<DomainError>)`). Ver `frontend-entity-leptos/references/leptos-entity-pattern.md`.
