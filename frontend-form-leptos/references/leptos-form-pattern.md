# Leptos Form Pattern (signals + UseCase + Result errors)

## Formulário — presentation/form_page.rs

```rust
use std::sync::Arc;

use leptos::prelude::*;
use leptos_router::hooks::use_navigate;

use crate::features::customers::application::create_customer::{
    CreateCustomer, CreateCustomerInput,
};
use crate::features::customers::domain::ports::CustomerRepository;
use crate::features::customers::infrastructure::http_repository::CustomerHttpRepository;

#[component]
pub fn CustomerFormPage() -> impl IntoView {
    let name = RwSignal::new(String::new());
    let email = RwSignal::new(String::new());
    let cpf = RwSignal::new(String::new());
    let errors = RwSignal::new(Vec::<String>::new());
    let submitting = RwSignal::new(false);
    let navigate = use_navigate();

    let on_submit = move |ev: leptos::ev::SubmitEvent| {
        ev.prevent_default();
        submitting.set(true);
        errors.set(vec![]);

        let repo: Arc<dyn CustomerRepository> = Arc::new(CustomerHttpRepository::new());
        let use_case = CreateCustomer::new(repo);

        leptos::task::spawn_local(async move {
            let result = use_case
                .execute(CreateCustomerInput {
                    name: name.get_untracked(),
                    email: email.get_untracked(),
                    cpf: cpf.get_untracked(),
                })
                .await;

            submitting.set(false);
            match result {
                Ok(_) => navigate("/customers", Default::default()),
                Err(errs) => {
                    errors.set(errs.iter().map(|e| e.to_string()).collect());
                }
            }
        });
    };

    view! {
        <div class="mx-auto max-w-lg space-y-4">
            <h1 class="text-2xl font-bold">"Novo Cliente"</h1>

            <Show when=move || !errors.get().is_empty()>
                <div class="flex flex-col gap-2">
                    <For
                        each=move || errors.get()
                        key=|e| e.clone()
                        children=move |e| view! {
                            <p class="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{e}</p>
                        }
                    />
                </div>
            </Show>

            <form class="space-y-4" on:submit=on_submit>
                <div>
                    <label class="mb-1 block text-sm">"Nome"</label>
                    <input
                        type="text"
                        class="w-full rounded-md border border-border bg-muted/20 px-3 py-2"
                        prop:value=move || name.get()
                        on:input=move |ev| name.set(event_target_value(&ev))
                    />
                </div>
                <div>
                    <label class="mb-1 block text-sm">"Email"</label>
                    <input
                        type="email"
                        class="w-full rounded-md border border-border bg-muted/20 px-3 py-2"
                        prop:value=move || email.get()
                        on:input=move |ev| email.set(event_target_value(&ev))
                    />
                </div>
                <div>
                    <label class="mb-1 block text-sm">"CPF"</label>
                    <input
                        type="text"
                        class="w-full rounded-md border border-border bg-muted/20 px-3 py-2"
                        prop:value=move || cpf.get()
                        on:input=move |ev| cpf.set(event_target_value(&ev))
                    />
                </div>
                <button
                    type="submit"
                    class="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                    disabled=move || submitting.get()
                >
                    {move || if submitting.get() { "Salvando..." } else { "Salvar" }}
                </button>
            </form>
        </div>
    }
}
```

## Checklist

- [ ] Campos com `RwSignal` + `on:input`
- [ ] Submit chama UseCase — não fetch direto
- [ ] `errors` exibe **todos** os itens de `Result::Err`
- [ ] `submitting` desabilita botão durante async
- [ ] Redirect em sucesso via `use_navigate()`
