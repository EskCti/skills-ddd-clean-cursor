# Dioxus — Padrão de Screen (strict UI/Logic separados)

## Estrutura

```
features/<bc>/presentation/
├── screens.rs          # telas do BC
└── widgets.rs          # widgets do BC (opcional)
```

## Separação UI vs lógica

- **Lógica**: hook `use_<domain>_<action>` que recebe o use case (`Arc<dyn ...>` sem Dioxus) e expõe signals.
- **UI**: `#[component]` que apenas renderiza a partir do hook.

## Exemplo — listagem

```rust
use dioxus::prelude::*;
use std::sync::Arc;
use crate::features::customers::application::ListCustomers;
use shared_kernel::Result as KResult;

fn use_customer_list(uc: Arc<ListCustomers>) -> (Signal<Vec<CustomerItem>>, Signal<Vec<String>>, Signal<bool>) {
    let items: Signal<Vec<CustomerItem>> = use_signal(Vec::new);
    let errors: Signal<Vec<String>> = use_signal(Vec::new);
    let loading: Signal<bool> = use_signal(|| true);

    use_effect(move || {
        spawn(async move {
            let res = uc.execute().await;
            match res {
                KResult::Ok(items) => items.set(items.map(|c| CustomerItem::from(c))),
                KResult::Err(errors) => errors.set(errors.iter().map(|e| e.message().to_string()).collect()),
            }
        });
    });

    (items, errors, loading)
}

#[component]
fn CustomerListScreen() -> Element {
    let items = use_signal(Vec::new);
    rsx! {
        section { class: "p-4",
            for c in items.read().iter() {
                div { class: "mb-2 rounded-lg border p-3", "{c.name}" }
            }
        }
    }
}
```

## Erros

- Renderizar **toda** a lista de erros com `<For>` (nunca só `errors[0]`).
- Missina: estado `loading` desabilita ações.

## Anti-patterns

- `use_effect` chamando HTTP/use case sem `spawn` bloqueando renderização.
- Derivar UI state de `use_memo` dependendo de `Result` shape interno (frágil com versões).