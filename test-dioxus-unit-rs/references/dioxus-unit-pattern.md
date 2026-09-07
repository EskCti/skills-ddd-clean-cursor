# Dioxus — Padrão de Testes Unitários

## Domínio/Aplicação (sem Dioxus)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn email_rejects_invalid_and_accumulates_errors() {
        let result = Email::try_new("x@");
        assert!(matches!(result, Err(errors) if errors.len() >= 1));
    }
}
```

## Componente (dioxus-testing)

```rust
#[cfg(test)]
mod tests {
    use dioxus_testing::*;

    #[tokio::test]
    async fn login_screen_shows_all_errors() {
        let errors = vec!["E-mail inválido".to_string(), "Senha curta".to_string()];
        let mut app = launch(LoginScreen { errors: errors.clone() });
        for e in errors {
            assert!(app.text_contains(&e));
        }
    }
}
```

## Mocks de ports

- `mockall` para traits `#[async_trait]`; structs fake para casos simples.
- Nunca compilar device code em testes (usar `#[cfg(test)]`).

## Cobertura

- `cargo llvm-cov -p mobile-dioxus --fail-under-lines 95` para domain+application (gate no CI — ver `config-cicd-rs`).