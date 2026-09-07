---
name: core-dioxus-native-access-rs
stack: rust
description: Abstrair APIs nativas (câmera, GPS, storage, notificações) via traits (ports) isolando hardware, com mocks para testes. Usar quando o pedido envolver acesso nativo Dioxus Mobile, plugin, permissões, câmera, GPS, storage ou notificações.
---

# Core Dioxus — Native Access

## Overview

Abstração de APIs nativas (câmera, GPS, storage local, notificações) via **traits (ports)** no domínio e adapters em `infrastructure/`, com **mocks para testes** e isolamento do hardware.

## Config

- Ports em `features/<bc>/domain/ports/` (traits `async_trait`).
- Adapters em `features/<bc>/infrastructure/` (impl usando `dioxus` quanto necessário, ou plugins).
- **Mocks** para testes unitários em `#[cfg(test)]` (não compilar device code em testes).
- Sujeitos a permissões de plataforma tratados no adapter, nunca no use case.

## Exemplo (câmera)

```rust
// domain/ports/camera.rs
#[async_trait]
pub trait CameraPort {
    async fn capture(&self) -> Result<CameraPhoto, DomainError>;
}

// infrastructure/camera_impl.rs
pub struct DioxusCamera;

#[async_trait]
impl CameraPort for DioxusCamera {
    async fn capture(&self) -> Result<CameraPhoto, DomainError> {
        // acionar câmera nativa via bridge/plugin
    }
}
```

## References

- Consultar `references/native-access-pattern.md` para details de mocks e permissões.

## Global Standards

- Consultar `../skills-standards.md`.