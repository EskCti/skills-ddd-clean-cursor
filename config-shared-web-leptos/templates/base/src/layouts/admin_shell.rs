use leptos::prelude::*;

use crate::components::{app_footer::AppFooter, sidebar_menu::SidebarMenu};

#[component]
pub fn AdminShell(children: Children) -> impl IntoView {
    let sidebar_open = RwSignal::new(true);

    view! {
        <div class="flex min-h-screen bg-background">
            <SidebarMenu open=sidebar_open/>
            <div class="flex flex-1 flex-col">
                <header class="flex h-14 items-center border-b border-border px-4">
                    <button
                        type="button"
                        class="mr-4 rounded-md p-2 hover:bg-muted md:hidden"
                        on:click=move |_| sidebar_open.update(|v| *v = !*v)
                    >
                        "☰"
                    </button>
                    <span class="font-semibold">"Application"</span>
                </header>
                <main class="flex-1 overflow-auto p-4 md:p-6">
                    {children()}
                </main>
                <AppFooter/>
            </div>
        </div>
    }
}
