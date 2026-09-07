# CI/CD Pattern (Rust — Axum + Cargo workspace)

## .github/workflows/ci.yml

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 3 * * *'

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
          cargo install cargo-llvm-cov --locked
          cargo llvm-cov --workspace --fail-under-lines 95 \
            --ignore-filename-regex '(tests/|main\.rs|config\.rs|infrastructure/|interfaces/)'

  memory-check:
    runs-on: ubuntu-latest
    needs: quality
    if: github.event_name == 'pull_request' || github.event_name == 'schedule'

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

> Ajuste `-p api` e paths de coverage conforme o workspace. O gate de coverage mede **domain + application de cada BC**: `infrastructure/` e `interfaces/` ficam fora da meta (adapter e HTTP são cobertos por E2E). Se um BC for um crate separado, rode o gate por crate (`-p <bc-crate>`). Ver também `memory-leak-check-rs.md`.

## Fechamento de épico (local)

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo llvm-cov --workspace --summary-only \
  --ignore-filename-regex '(tests/|main\.rs|config\.rs|infrastructure/|interfaces/)'
bash config-cicd-rs/scripts/check-memory-rs.sh
# Push e aguardar CI verde
```

## CD (resumo)

`cd.yml` em push para `main` / tags `v*`: build Docker multi-stage (`config-docker-rs`), push GHCR, deploy.
