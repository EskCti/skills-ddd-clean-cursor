---
name: config-dioxus-cicd-rs
stack: rust
description: CI/CD para build mobile Dioxus (iOS + Android) com assinatura de apps e publicação em stores. Usar quando o pedido envolver pipeline mobile, GitHub Actions para app, assinatura iOS/Android, ou publicação em App Store/Play Store.
---

# Config Dioxus — CI/CD

## Overview

CI/CD para o app mobile Dioxus: build Android (APK/AAB) e iOS (Xcode), assinatura de apps, publicação em stores (Play Console / App Store Connect), além do pipeline base de `config-cicd-rs`.

## Config

- **CI**: `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test -p mobile-dioxus`, `cargo llvm-cov` (≥95% domain+application).
- **Build Android**: `cargo mobile build --platform android --release` → `aab` assinado (keystore em secrets).
- **Build iOS**: `cargo mobile build --platform ios --release` → `.ipa`/`.xcarchive` assinado (certificado + provisioning profile em secrets).
- **Publicação**: workflows separados (`release-android.yml`, `release-ios.yml`) disparados por tag `v*`.

## Regras

- **Nunca** commitar keystores, certificados ou provisioning profiles (`.gitignore`).
- Secrets via GitHub Actions secrets (não env vars do repo).
- Build de release apenas em tag; PRs rodam apenas lint/test/coverage.

## References

- Consultar `references/cicd-dioxus-pattern.md` para workflows YAML.
- Consultar `../config-cicd-rs/SKILL.md` para o pipeline base (clippy/test/coverage/memory-check).

## Global Standards

- Consultar `../skills-standards.md` §Test Coverage e §Epic DoD.