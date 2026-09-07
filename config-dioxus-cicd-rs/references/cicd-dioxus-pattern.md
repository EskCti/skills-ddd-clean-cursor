# Dioxus — Padrão de CI/CD Mobile

## CI (PR) — `.github/workflows/ci.yml`

```yaml
name: CI
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      - run: cargo fmt --check
      - run: cargo clippy --workspace --all-targets -- -D warnings
      - run: cargo test --workspace
      - run: cargo install cargo-llvm-cov --locked
      - run: cargo llvm-cov --workspace --fail-under-lines 95
```

## Build Android (release) — `release-android.yml`

- Job em `ubuntu-latest` com `cargo-mobile` instalado.
- `cargo mobile build --platform android --release`
- Assinar AAB com keystore: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS` (secrets).
- Upload de artefato; publicação via `fastlane supply`/`google-play` (opcional).

## Build iOS (release) — `release-ios.yml`

- Job em `macos-latest` com `cargo-mobile` e Xcode.
- `cargo mobile build --platform ios --release`
- Assinar com certificado + provisioning profile (secrets).
- Upload para App Store Connect via `fastlane`/`altool`.

## Regras de segurança

- Keystores/certificados **nunca** no repo (`.gitignore` + secrets).
- Release somente em tag `v*`; PRs apenas quality.
- Secrets referenciados como `${{ secrets.* }}`.