# Dioxus — Padrão de Acesso Nativo

## Ports

```rust
#[async_trait]
pub trait NotificationPort {
    async fn request_permission(&self) -> shared_kernel::Result<()>;
    async fn send(&self, title: &str, body: &str) -> shared_kernel::Result<()>;
}
```

## Adapter (infrastructure)

- Implementa usando plugin/rust `dioxus-native` ou chamadas de sistema da plataforma.
- Trata permissões e erros de hardware → `DomainError`.

## Mock para tests

```rust
#[cfg(test)]
pub struct MockNotification;

#[cfg(test)]
#[async_trait]
impl NotificationPort for MockNotification {
    async fn request_permission(&self) -> shared_kernel::Result<()> { Ok(()) }
    ...
}
```

- Mock em `#[cfg(test)]` que **não compila código de device**.