# Bootstrap contract — Rust workspace

| Item | Padrão |
|------|--------|
| HTTP | Axum 0.8 |
| Async runtime | Tokio |
| DB | sqlx + Postgres |
| Porta default | `4000` (`BIND_ADDR=0.0.0.0:4000`) |
| BC layout | `crates/api/src/modules/<bc>/` |
| Kernel | `crates/shared-kernel` |

Cada novo BC via `config-new-module-rs` — nunca aninhar `customer::Customer`.
