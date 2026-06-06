# Leptos Page Pattern (SSR + Resource + UseCase)

## Listagem — presentation/list_page.rs

```rust
use std::sync::Arc;

use leptos::prelude::*;
use leptos_router::components::A;

use crate::features::customers::application::list_customers::ListCustomers;
use crate::features::customers::domain::ports::CustomerRepository;
use crate::features::customers::infrastructure::http_repository::CustomerHttpRepository;

fn customer_services() -> ListCustomers {
    let repo: Arc<dyn CustomerRepository> = Arc::new(CustomerHttpRepository::new());
    ListCustomers::new(repo)
}

#[component]
pub fn CustomerListPage() -> impl IntoView {
    let list = customer_services();
    let customers_res = Resource::new(move || async move { list.execute().await });

    view! {
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold">"Clientes"</h1>
                <A href="/customers/new" class="rounded-md bg-primary px-4 py-2 text-sm text-white">
                    "Novo Cliente"
                </A>
            </div>

            <Transition fallback=|| view! { <p>"Carregando..."</p> }>
                {move || match customers_res.get() {
                    None => view! { <p>"Carregando..."</p> }.into_any(),
                    Some(Ok(customers)) => view! {
                        <table class="w-full border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-border text-left">
                                    <th class="p-2">"Nome"</th>
                                    <th class="p-2">"Email"</th>
                                    <th class="p-2">"CPF"</th>
                                    <th class="p-2">"Status"</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For
                                    each=move || customers.clone()
                                    key=|c| c.id().to_string()
                                    children=move |c| view! {
                                        <tr class="border-b border-border/50">
                                            <td class="p-2">{c.name().to_string()}</td>
                                            <td class="p-2">{c.email().to_string()}</td>
                                            <td class="p-2">{c.cpf().to_string()}</td>
                                            <td class="p-2">
                                                {if c.is_active() { "Ativo" } else { "Inativo" }}
                                            </td>
                                        </tr>
                                    }
                                />
                            </tbody>
                        </table>
                    }.into_any(),
                    Some(Err(errors)) => view! {
                        <div class="flex flex-col gap-2">
                            <For
                                each=move || errors.clone()
                                key=|e| e.to_string()
                                children=move |e| view! {
                                    <p class="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                        {e.to_string()}
                                    </p>
                                }
                            />
                        </div>
                    }.into_any(),
                }}
            </Transition>
        </div>
    }
}
```

## Arquitetura de Camadas

```
Presentation (Leptos #[component])
      ↓ instancia e chama
Application (ListCustomers.execute())
      ↓ recebe no construtor
Domain (CustomerRepository trait)
      ↓ implementado por
Infrastructure (CustomerHttpRepository → reqwest → API)
```

## Checklist

- [ ] Componente usa UseCase (não `reqwest` direto)
- [ ] `Resource` para dados async SSR
- [ ] Erros exibidos com `<For>` — **lista completa**
- [ ] Layout Tailwind (`flex`, `grid`, `p-*`)
- [ ] Rota registrada em `app.rs`
