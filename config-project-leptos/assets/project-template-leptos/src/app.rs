use leptos::prelude::*;
use leptos_meta::*;
use leptos_router::components::{Route, Router, Routes};

use crate::pages::dashboard::DashboardPage;

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Html lang="pt-BR" class="dark" />
        <Stylesheet id="leptos" href="/pkg/web-leptos.css"/>
        <Title text="Application"/>
        <Router>
            <main class="min-h-screen bg-background text-foreground">
                <Routes fallback=|| view! { <p class="p-8">"Página não encontrada"</p> }>
                    <Route path=path!("/") view=DashboardPage/>
                </Routes>
            </main>
        </Router>
    }
}
