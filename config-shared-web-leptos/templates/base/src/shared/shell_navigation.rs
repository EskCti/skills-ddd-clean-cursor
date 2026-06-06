pub struct NavItem {
    pub label: &'static str,
    pub href: &'static str,
}

pub fn main_nav_items() -> Vec<NavItem> {
    vec![
        NavItem { label: "Dashboard", href: "/" },
        NavItem { label: "Exemplos", href: "/examples" },
    ]
}
