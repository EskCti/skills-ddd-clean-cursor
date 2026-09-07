# Dioxus — Padrão de Testes E2E

## Setup

- Postgres de teste via docker-compose (`docker-compose.yml` do `config-project-rs`) ou Testcontainers.
- Subir a API Axum (`cargo run -p api`) com `DATABASE_URL` de teste.
- App sob teste: `dioxus-testing` com `launch(App)`.

## Exemplo — login com lista de erros

```rust
#[tokio::test]
async fn login_shows_all_errors_from_api() {
    let mut app = launch(App);
    app.click("button#login");
    // API responde 400 { errors: ["E-mail inválido", "Senha curta"] }
    assert!(app.text_contains("E-mail inválido"));
    assert!(app.text_contains("Senha curta"));
}
```

## Fluxos obrigatórios

1. Login sucesso → redireciona para dashboard.
2. Login falha → lista completa de erros.
3. CRUD: create → read → update → delete.
4. Guard: sem token → redireciona para `/login`.

## DoD

- E2E verde antes de fechar épico (`skills-standards.md` §Epic DoD).