use leptos::prelude::*;

#[component]
pub fn DashboardPage() -> impl IntoView {
    view! {
        <div>
            <h1 class="text-2xl font-bold">"Dashboard"</h1>
            <p class="mt-2 text-muted-foreground">"Bem-vindo ao painel administrativo."</p>
        </div>
    }
}
