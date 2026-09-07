# Dioxus Mobile — Layout modular e namespaces (Clean Architecture)

Referência obrigatória para **todos** os skills `-dioxus-rs` de mobile.

## Princípio: camadas sim, redundância não

Organize por **Bounded Context** (módulo) e **camada arquitetural**. O tipo principal vive na camada — **não** repita o nome do agregado como submódulo.

| Evitar (redundante) | Usar (profissional) |
|---------------------|---------------------|
| `features::customers::domain::customer::Customer` | `features::customers::domain::Customer` |
| `features::customers::presentation::customer_list::CustomerListScreen` | `features::customers::presentation::CustomerListScreen` |
| lógica de negócio em `#[component]` | use case em `application/` |
| DTO do backend importado direto na screen | use case retorna entidade de domínio |

## Árvore padrão por Bounded Context

```
mobile-dioxus/src/
├── lib.rs
├── main.rs                 # entrypoint por plataforma
├── app.rs                  # App raiz (Router + providers + theming)
├── features/
│   └── customers/
│       ├── domain/         # entidade + VOs + ports (sem Dioxus)
│       ├── application/    # use cases (arc<dyn Repository>)
│       ├── infrastructure/ # repository DTO/HTTP + platform bridges
│       └── presentation/   # screens + widgets do BC
├── screens/                # telas compartilhadas do app
├── widgets/                # componentes reutilizáveis
├── navigation/             # dioxus-router config e guards
├── services/               # api_client, bridge nativo
└── shared/                 # theme, utils, Result helpers
```

## Regras de arquivo

| Regra | Detalhe |
|-------|---------|
| Um componente por arquivo | `customer_list_screen.rs` → `CustomerListScreen` |
| Pasta BC | kebab-case |
| Módulo Rust | snake_case |
| Funções de screen | `#[component]` em `presentation/screens.rs` |
| Widgets | `#[component]` em `widgets/` |
| Domain/Application | **sem** import `dioxus::*` |
| DTO | em `application/dto.rs` com `serde::Deserialize` reutilizando `shared_kernel` |

## Integração com shared-kernel

- `shared_kernel::Result<T>` (`Err(Vec<DomainError>)`) compartilhado entre o app e a API (`config-fullstack-rust-rs`).
- `Result` do domínio **não** vaza para DTOs; o adapter converte.
- Plataform bridges viram ports em `domain/ports/` + impl em `services/`.

## Anti-patterns

- Imports `dioxus::*` em `domain/` ou `application/`.
- Screens gerenciando estado global manualmente (usar `core-dioxus-state-rs`).
- Chamar `reqwest` direto dentro da screen (usar repository port).
- Strings soltas de rota/navegação (usar rotas tipadas de `core-dioxus-navigation-rs`).