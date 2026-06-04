#!/usr/bin/env bash
# Verificação de vazamento de memória — rodar ao fechar cada épico Rust.
# Uso: bash config-cicd-rs/scripts/check-memory-rs.sh
set -euo pipefail

if [[ "${SKIP_MEMORY_CHECK:-}" == "1" ]]; then
  echo "SKIP_MEMORY_CHECK=1 — memory check skipped"
  exit 0
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

PKG="${MEMORY_CHECK_PACKAGE:-api}"
THREADS="${MEMORY_CHECK_THREADS:-1}"

echo "==> Rust memory check (package: $PKG)"

echo "==> Build workspace (debug)"
cargo build --workspace

echo "==> Unit + integration tests (baseline)"
cargo test --workspace

run_leak_sanitizer() {
  if ! rustup toolchain list 2>/dev/null | grep -q nightly; then
    return 1
  fi
  echo "==> LeakSanitizer (nightly) on integration tests"
  RUSTFLAGS="-Z sanitizer=leak" \
  RUSTDOCFLAGS="-Z sanitizer=leak" \
    cargo +nightly test -p "$PKG" --test integration -- --test-threads="$THREADS"
  return 0
}

run_valgrind() {
  if ! command -v valgrind >/dev/null 2>&1; then
    return 1
  fi
  local bin
  bin="$(find target/debug -maxdepth 1 -type f -name "$PKG" 2>/dev/null | head -1)"
  if [[ -z "$bin" ]]; then
    bin="$(find target/debug -maxdepth 3 -type f -executable -name 'api' 2>/dev/null | head -1)"
  fi
  if [[ -z "$bin" || ! -x "$bin" ]]; then
    echo "Valgrind: binary not found — run integration tests via cargo test only"
    return 1
  fi
  echo "==> Valgrind leak check: $bin"
  valgrind --error-exitcode=42 --leak-check=full --show-leak-kinds=all \
    "$bin" 2>&1 | tee /tmp/valgrind-rust.log
  return 0
}

if run_leak_sanitizer; then
  echo "PASS: LeakSanitizer"
  exit 0
fi

if run_valgrind; then
  echo "PASS: Valgrind"
  exit 0
fi

echo ""
echo "FAIL: no memory leak checker available."
echo "Install one of:"
echo "  rustup toolchain install nightly && rustup component add rust-src --toolchain nightly"
echo "  apt-get install valgrind  # Linux"
echo "Or set SKIP_MEMORY_CHECK=1 only for local emergency (not for epic DoD)."
exit 1
