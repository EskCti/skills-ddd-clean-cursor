# CI/CD Pattern (Rust — Axum + Cargo workspace)

## .github/workflows/ci.yml

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgres://test:test@localhost:5432/test_db
      RUST_BACKTRACE: 1

    steps:
      - uses: actions/checkout@v4

      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - uses: Swatinem/rust-cache@v2

      - name: Format
        run: cargo fmt --all -- --check

      - name: Clippy
        run: cargo clippy --workspace --all-targets -- -D warnings

      - name: Test
        run: cargo test --workspace

      - name: Coverage gate (domain + application ≥95%)
        run: |
          cargo install cargo-llvm-cov --locked 2>/dev/null || true
          cargo llvm-cov --workspace --fail-under-lines 95 \
            --ignore-filename-regex '(tests/|main\.rs|config\.rs)'

  memory-check:
    runs-on: ubuntu-latest
    needs: quality
    if: github.event_name == 'pull_request'

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgres://test:test@localhost:5432/test_db

    steps:
      - uses: actions/checkout@v4

      - uses: dtolnay/rust-toolchain@nightly

      - uses: Swatinem/rust-cache@v2

      - name: Memory leak check (LeakSanitizer)
        run: |
          RUSTFLAGS="-Z sanitizer=leak" \
          RUSTDOCFLAGS="-Z sanitizer=leak" \
            cargo test -p api --test integration -- --test-threads=1
```

> Ajuste `-p api` e paths de coverage conforme o workspace. Ver também `memory-leak-check-rs.md`.

## Fechamento de épico (local)

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo llvm-cov --workspace --summary-only
bash config-cicd-rs/scripts/check-memory-rs.sh
# Push e aguardar CI verde
```

## CD (resumo)

`cd.yml` em push para `main` / tags `v*`: build Docker multi-stage (`config-docker-rs`), push GHCR, deploy.
