# Docker Pattern (Rust — Axum + workspace Cargo)

## Dockerfile (multi-stage, raiz do workspace)

```dockerfile
# Stage 1: Builder — toolchain completa + cache de dependências
FROM rust:1-bookworm AS builder
WORKDIR /workspace

# 1. Manifests + lock primeiro (cache de camada de dependências)
COPY Cargo.toml Cargo.lock ./
COPY crates/shared-kernel/Cargo.toml crates/shared-kernel/Cargo.toml
COPY crates/api/Cargo.toml crates/api/Cargo.toml

# 2. Stubs para compilar e cachear dependências antes do código real
RUN mkdir -p crates/shared-kernel/src crates/api/src \
  && printf 'pub fn placeholder() {}\n' > crates/shared-kernel/src/lib.rs \
  && printf 'fn main() {}\n' > crates/api/src/main.rs

# 3. Build separado de dependências (cachea ~90% das crates)
RUN cargo build --release -p api --locked

# 4. Workspace completo + migrations (sqlx offline: embedded migrations)
COPY crates crates
COPY migrations migrations

# 5. Build real da aplicação
RUN cargo build --release -p api --locked

# Stage 2: Runner — imagem enxuta, usuário não-root
FROM debian:bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r app && useradd -r -g app -d /app app

COPY --from=builder /workspace/target/release/api /app/api

USER app
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:4000/health >/dev/null || exit 1

ENTRYPOINT ["/app/api"]
```

> **sqlx offline**: `migrations/` é copiada antes do build porque `sqlx::migrate::embedded::migrations!()` embebe os SQL em compile-time (`sqlx prepare` — ver `config-sqlx-rs`). Sem isso, o build tenta conectar ao Postgres e falha.

> **Cache de deps**: nunca `COPY . .` antes do primeiro `cargo build` — o Docker cachea a camada só enquanto `Cargo.toml`/`Cargo.lock` não mudam.

## docker-compose.prod.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      BIND_ADDR: 0.0.0.0:4000
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    depends_on:
      - postgres
      - postgres:
          condition: service_healthy

volumes:
  postgres_data:
```

## .dockerignore

```
target
.git
.env
.env.*
*.log
tests
docs
docker-compose*.yml
```

## Checklist

- [ ] `Cargo.lock` versionado (build reprodutível com `--locked`)
- [ ] `migrations/` incluída no contexto (sqlx offline)
- [ ] Build de deps em `RUN` separado (cache de camada)
- [ ] Runner sem toolchain, usuário não-root, `EXPOSE 4000`
- [ ] `docker build -t app-api .` validado localmente
- [ ] Imagem final < 100MB (binário estático + runtime slim)