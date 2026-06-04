# Rust — Verificação de vazamento de memória

**Quando rodar**: ao concluir cada **épico/BC** (antes de merge/archive OpenSpec), depois de `cargo test` e do pipeline CI local ou remoto.

> Em Rust **safe**, vazamentos costumam vir de: `Arc`/`Rc` ciclos, tasks Tokio não awaited, `Box::leak`, buffers globais, FFI — não de “esquecer free” como em C.

---

## Checklist rápido (code review)

- [ ] Nenhum `std::mem::forget` / `Box::leak` sem justificativa documentada
- [ ] Handlers Axum não spawnam tasks “fire-and-forget” sem `JoinHandle` e shutdown no teste
- [ ] Pools sqlx/Tokio criados uma vez (AppState) e reutilizados — não novo pool por request
- [ ] `Rc`/`RefCell` evitados em caminhos async multi-thread (preferir `Arc`)
- [ ] Testes E2E derrubam o runtime (drop explícito do app ou processo termina)

---

## Comandos (ordem sugerida)

Após implementar o épico:

```bash
# 1. Qualidade base (igual CI)
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo llvm-cov --workspace --summary-only   # gate ≥95% domain+application

# 2. Miri — undefined behavior (recomendado em domain/shared-kernel)
rustup component add miri 2>/dev/null || true
cargo miri test -p shared-kernel
# Opcional por BC: cargo miri test -p api --lib

# 3. Vazamento — script do repositório
bash config-cicd-rs/scripts/check-memory-rs.sh
```

---

## Script `check-memory-rs.sh`

Estratégia (em ordem de disponibilidade):

1. **LeakSanitizer** (nightly): testes de integração com `RUSTFLAGS="-Z sanitizer=leak"`.
2. **Valgrind**: binário de integração ou `api` em debug, se `valgrind` estiver instalado.
3. Se nenhum disponível: falha com mensagem para instalar nightly ou valgrind — não silencia o check.

Variáveis:

| Variável | Default | Uso |
|----------|---------|-----|
| `SKIP_MEMORY_CHECK` | — | `1` pula o script (só emergência local) |
| `MEMORY_CHECK_PACKAGE` | `api` | Crate alvo dos testes de integração |
| `MEMORY_CHECK_THREADS` | `1` | Threads para sanitizers |

---

## Integração CI

Job opcional `memory-check` no `ci.yml` (ver `cicd-pattern-rs.md`):

- Roda em PRs que tocam `crates/**`, `Cargo.toml`, `tests/**`
- Usa `rust-toolchain: nightly` só nesse job
- Não substitui `cargo test` normal — complementa

---

## Definition of Done (épico Rust)

Antes de `openspec-archive-change` ou merge:

1. `cargo test --workspace` verde  
2. `cargo clippy` sem warnings  
3. Coverage ≥95% domain+application  
4. E2E do BC (`cargo test --test integration`)  
5. **Memory check** (`check-memory-rs.sh` ou job CI `memory-check`)  
6. Pipeline CI remoto verde (GitHub Actions)
