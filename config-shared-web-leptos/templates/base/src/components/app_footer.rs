use leptos::prelude::*;

#[component]
pub fn AppFooter() -> impl IntoView {
    view! {
        <footer class="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
            "© Application"
        </footer>
    }
}
