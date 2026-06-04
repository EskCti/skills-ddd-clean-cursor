---
name: config-cicd-rs
stack: rust
description: Pipeline CI/CD GitHub Actions para Rust (clippy, test, coverage, memory leak check). Usar quando o pedido envolver workflow Rust, gate de qualidade ou fechamento de épico com verificação de vazamento.
---

# Config CI/CD (Rust)

## Overview

Workflow CI: `cargo fmt --check`, `cargo clippy`, `cargo test --workspace`, coverage (`cargo llvm-cov`) — meta **≥95%** em domain+application — e **verificação de vazamento de memória** ao fechar cada épico.

## Fechamento de épico (obrigatório)

Antes de merge ou `openspec-archive-change`:

1. `cargo test --workspace` + E2E (`cargo test --test integration`)
2. `cargo clippy` sem warnings
3. Coverage ≥95% domain+application
4. **`bash config-cicd-rs/scripts/check-memory-rs.sh`** (LeakSanitizer ou Valgrind)
5. CI remoto verde (`.github/workflows/ci.yml`)

Detalhes: `references/memory-leak-check-rs.md`

## Workflow

1. Copiar template de `references/cicd-pattern-rs.md` para `.github/workflows/ci.yml`.
2. Copiar `scripts/check-memory-rs.sh` para `scripts/check-memory-rs.sh` no projeto (ou chamar do skill path).
3. Serviço Postgres para testes de integração.
4. Job `memory-check` (nightly + LeakSanitizer) em PRs.
5. Falhar PR se coverage ou memory check falhar.

## Commands

```bash
# Gate local (espelha CI + memória)
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
bash config-cicd-rs/scripts/check-memory-rs.sh
```

## Resources

- `references/cicd-pattern-rs.md`
- `references/memory-leak-check-rs.md`
- `scripts/check-memory-rs.sh`
- `../skills-standards.md` — seção **Rust** e **Epic Definition of Done**

## Global Standards

- Consultar `../skills-standards.md` seção Rust.
