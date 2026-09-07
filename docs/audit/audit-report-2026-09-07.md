# Relatório de Auditoria — skills-ddd-clean-cursor

**Data:** 2026-09-07
**Escopo:** 148 diretórios — skills TypeScript, Kotlin, C#, Java, Rust (backend `-rs`), frontend (Angular/Vue/Leptos), mobile (Flutter/Android), requisitos (`req-*`), OpenSpec, workflow/utilitários.
**Padrões avaliados:** `skills-standards.md` (§4.1 Tailwind, §5.1 Result com lista de erros, §7 Kotlin, §8 C#, §9 Rust, §10 Java, §11 camadas/cobertura/DoD).
**Método:** auditoria baseada na leitura de `SKILL.md`, `references/`, `scripts/` e `assets/` de cada skill.

---

## Resumo Executivo

| Estado | Qtde aprox. | Grupos |
|--------|------|--------|
| ✅ OK | ~88 | Maioria das `core-*`, `frontend-*`, `mobile-*` de apresentação, `req-*`, workflow |
| ⚠️ Precisa Melhoria | ~38 | Lista de erros colapsada, exemplos não compiláveis, gates decorativos, referências quebradas |
| ❌ Crítico | 8 | `api`, `config-auth-*-kt`, `config-auth-backend-basic-cs`, `config-auth-core-basic-cs`, `mobile-repository-flutter`, `openspec-context-cache`, `config-docker-rs` |

### Achados transversais prioritários

> **Status pós-fix (mesmo dia:** todos os 5 achados acima foram corrigidos e verificados — ver §7.**

1. **Contrato de erro "lista completa" (§5.1) não chega à fronteira HTTP/UI** em várias stacks — VOs com `throw`/early-return (TS `core-value-object`), templates auth Kotlin usando `kotlin.Result` de primeira falha, adaptadores HTTP colapsando `{errors:[...]}` em `message` único (Angular/Vue/Leptos/Flutter/Android).
2. **Exemplos de código Rust (Lept e e-rs) não compilam** — pulso-do-`std` sem dependência declarada e sintaxe inválida (`if let Ok(...)`, `Result::Err(Vec<...>)`, etc.).
3. **Gates de cobertura decorativos**: `config-cicd` (TS `check-coverage.mjs` passa com 0 arquivos), `config-cicd-kt` (`-PminCoverage` não efetivo).
4. **Artefato residual**: pasta `api/` contém código C# (`MetricsController.cs`) sem `SKILL.md`.
5. **Templates geram código que não compila em runtime real** — auth CS (`.Error`, JWT inventado), template Rust workspace (`Router` mismatch), `config-new-module-cs` placeholder.

---

## 1. Skills Rust (sufixo `-rs`) — auditoria profunda (FASE 2)

Referência: `config-shared-core-rs/references/rust-namespace-layout.md` é a peça central; todas as 17 skills expõem `stack: rust` + `agents/openai.yaml` (cumprem §5).

| Skill | Status | Camada | Prioridade |
|-------|--------|--------|-----------|
| `backend-controller-rs` | ⚠️ | Interface | **Alta** |
| `backend-data-rs` | ⚠️ | Infrastructure | Média |
| `config-cicd-rs` | ⚠️ | Cross-cutting | Baixa |
| `config-docker-rs` | ❌ | Infrastructure | **Alta** |
| `config-new-module-rs` | ⚠️ | Cross-cutting | **Alta** |
| `config-project-rs` | ⚠️ | Cross-cutting | Média |
| `config-shared-core-rs` | ⚠️ | Cross-cutting | Média |
| `config-sqlx-rs` | ⚠️ | Infrastructure | Média |
| `core-domain-service-rs` | ✅ | Domain | Baixa |
| `core-dto-rs` | ⚠️ | Application | Média |
| `core-entity-rs` | ✅ | Domain | Baixa |
| `core-query-cqrs-rs` | ⚠️ | Application | Média |
| `core-repository-rs` | ⚠️ | Domain | Baixa |
| `core-use-case-rs` | ⚠️ | Application | Média |
| `core-value-object-rs` | ✅ | Domain | Baixa |
| `test-e2e-rs` | ⚠️ | Quality | **Alta** |
| `test-unit-rs` | ⚠️ | Quality | Média |

### Detalhamento

- **`backend-controller-rs`** ⚠️ — Violação §5.1 regra 3: mapeia "AppError → 404/400/500" sem instruir retorno `{ errors: [...] }` completo no `400`. Sem exemplo de handler/extractor `State<AppState>`, sem regras NÃO FAZER. → adicionar `references/handler-pattern-rs.md`.
- **`backend-data-rs`** ⚠️ — Separação port/adapter impecável (`CustomerRecord` ≠ `domain::Customer`). Sem exemplo de mapeamento, sem cross-ref ao padrão de pool único, sem NÃO FAZER.
- **`config-cicd-rs`** ⚠️ — `memory-check` só em PR (sem `schedule:` nightly); gate `llvm-cov --workspace` mede infra além de domain+application; `|| true` engole falha de instalação. → ajustar gate + adicionar `schedule`.
- **`config-docker-rs`** ❌ — **sem nenhum Dockerfile**: só diagrama e 3 passos. Ignora workspace multi-crate (path-dep `shared-kernel`), não copia `Cargo.lock`/`migrations/`, sem `.dockerignore`/`.compose.prod`. → *reescrever com Dockerfile multi-stage compilável + compose.prod + não-root*.
- **`config-new-module-rs`** ⚠️ — Script determinístico (`create-module-rs.mjs`) bom, mas código gerado **não compila** (dialecto `std` semil deps + `todo!()`); inferência de plural falha em casos irregulares. → validar `cargo check -p api` pós-scaffold.
- **`config-project-rs`** ⚠️ — Script idempotente, template real de workspace. Inconsistência de tipos `Router` mismatch em `lib.rs`/`health/mod.rs`; `main.rs` `Box<dyn error>` sem dep; `--project-name` cosmético.
- **`config-shared-core-rs`** ⚠️ — `rust-namespace-layout.md` e `shared-patterns-rs.md` sólidos. Referência rota `assets/shared-template-rs/` (pasta não existe); `errors(&self) -> &[DomainError]` devolvendo `&[]` é ref temporária inválida.
- **`config-sqlx-rs`** ⚠️ — Possível mismatch binário (`sqlx-cli` vs `sqlx`); sem exemplo de migração SQL; sem NÃO FAZER.
- **`core-domain-service-rs`** ✅ — Scope perfeito, exemplo completo, checklist de testes.
- **`core-dto-rs`** ⚠️ — Skill mais curta (21 linhas): sem workflow, sem exemplo, sem NÃO FAZER; não menciona DTO de erro `{errors:[...]}`.
- **`core-entity-rs`** ✅ — `try_new` acumula erros dos VOs; regra NÃO FAZER de namespace explícita.
- **`core-query-cqrs-rs`** ⚠️ — **Trait `Query` inexistente** mencionado (não existe no `shared-kernel`); sem exemplo.
- **`core-repository-rs`** ⚠️ — Port com `#[async_trait]`/adapter `*Sqlx`; sem exemplo completo e sem NÃO FAZER.
- **`core-use-case-rs`** ⚠️ — DI do port (`Arc<dyn CustomerRepository>`), naming limpo. Sem exemplo completo/regras.
- **`core-value-object-rs`** ✅ — Acumula todos os erros antes do `Result::Err` (cumpre §5.1-1).
- **`test-e2e-rs`** ⚠️ — **Sem exemplo** de teste de integração; `testcontainers`/`reqwest` não nos dev-deps; dois clientes HTTP. → *exemplo completo + alinhar dev-deps + verificar `errors`*.
- **`test-unit-rs`** ⚠️ — Meta ≥95% correta; `mockall` não nos dev-deps; sem exemplo de teste.

---

## 2. Skills TypeScript (sem sufixo)

### Hallazgos globais TS
- **Gate de cobertura falso-PASS**: `config-cicd/assets/check-coverage.mjs:69` → `pct = total > 0 ? ... : 100`. Ação: falhar quando `matched === 0`.
- **§5.1 perdidos** em `core-value-object` (skeleton usa `throw new Error` no primeiro check) e templates `config-auth-core-*` (`throwsIfFailed` → `join(', ')`).
- **Artefato residual**: pasta `api/` com `MetricsController.cs` sem SKILL.md — remover ou reconstruir.

### Tabela resumo TS
| Skill | Status | Observação |
|-------|--------|-----------|
| `api` | ❌ | Resíduo C# sem SKILL.md |
| `backend-controller` | ✅ | Fino, traduz Result → exceções HTTP |
| `backend-prisma-data` | ✅ | `toDomain/fromDomain`, transações, CQRS no adapter |
| `config-auth-backend-basic` | ✅ | 11 endpoints, envelope `{errors}` |
| `config-auth-core-basic` | ⚠️ | `throwsIfFailed` colapsa lista |
| `config-auth-core-full` | ⚠️ | Idem + SKILL menos rico |
| `config-auth-web-basic` | ✅ | Shell + guards + token scoped |
| `config-cicd` | ⚠️ | Coverage fake-pass; E2E web faltando CI |
| `config-docker` | ⚠️ | `npm ci` antes de `COPY packages` (workspace); sem HEALTHCHECK |
| `config-new-module` | ✅ | Script determinístico 982 linhas |
| `config-prisma` | ✅ | Contrato transacional |
| `config-project` | ✅ | Bootstrap robusto; `remotePatterns "**"` (SSRF) |
| `config-shared-core` | ✅ | `Result.combine` canônico |
| `config-shared-web` | ✅ | Shell admin Tailwind |
| `core-domain-service` | ✅ | Fronteira `domain/core` |
| `core-dto` | ✅ | Tipos In/Out/Query |
| `core-entity` | ✅ | `tryCreate` combina erros |
| `core-query-cqrs` | ✅ | Deita separada |
| `core-repository` | ✅ | Port/adapter + mocks |
| `core-use-case` | ✅ | Orquestração pura |
| `core-value-object` | ⚠️ | Skeleton de early-return (`throw`) |
| `frontend-form-schema` | ⚠️ | Paths desatualizados (`packages/*/web` → `apps/web/src`) |
| `test-e2e` | ⚠️ | `--template=feature` falha em runtime |
| `test-unit` | ✅ | Gate ≥95% |

---

## 3. Kotlin, C#, Java

Global: `core-entity`/`core-value-object`/`core-domain-service` OK nas 3. **Pior violação §5.1 é Kotlin auth**; **templates CS auth não compilam**.

### 3.1 Kotlin (`-kt`)

| Skill | Status | Observação |
|-------|--------|-----------|
| `backend-controller-kt` | ⚠️ | `kotlin.Result` + `mapOf("error")` — viola lista |
| `backend-data-kt` | ⚠️ | Exemplos `Result<Unit>` → `DomainResult` |
| `config-auth-backend-basic-kt` | ❌ | `mapOf("error" to e.message)` |
| `config-auth-core-basic-kt` | ❌ | `kotlin.Result` + first-fala; sem acumular |
| `config-auth-core-full-kt` | ❌ | Herda básico |
| `config-cicd-kt` | ⚠️ | Gate JaCoCo decorativo (nunca falha) |
| `config-docker-kt` | ✅ | Multi-stage; `EXPOSE 8080` vs padrão 4000 |
| `config-jpa-kt` | ✅ | `ddl-auto:validate` + Flyway |
| `config-new-module-kt` | ⚠️ | Path `apps/backend` vs `apps/backend-kt` inconsistente |
| `config-project-kt` | ✅ | Gradle multi-módulo |
| `config-shared-core-kt` | ✅ | `DomainResult` + `combine` + VOs acumulando |
| `core-domain-service-kt` | ✅ | |
| `core-dto-kt` | ✅ | |
| `core-entity-kt` | ✅ | Combina erros |
| `core-query-cqrs-kt` | ⚠️ | Exemplo `Result<ProductDetailsDTO?>`, sem VO `Id` |
| `core-repository-kt` | ⚠️ | `Result<Unit>` → `DomainResult` |
| `core-use-case-kt` | ⚠️ | Assinatura `Result<OUT>` vs `DomainResult` |
| `core-value-object-kt` | ✅ | Acumula em `mutableListOf` |
| `test-e2e-kt` | ✅ | MockMvc + Testcontainers |
| `test-unit-kt` | ⚠️ | Exemplo `Result.success` vs `DomainResult` |

→ Migrar 3 templates auth para `DomainResult` com `errors: List<String>` acumulando; gate JaCoCo real (`jacoco.xml`).

### 3.2 C# (`-cs`)

| Skill | Status | Observação |
|-------|--------|-----------|
| `backend-controller-cs` | ✅ | `BadRequest(result.Errors)` |
| `backend-data-cs` | ✅ | Dbo separado |
| `config-auth-backend-basic-cs` | ❌ | `result.Error` inexistente; JWT APIs inventadas |
| `config-auth-core-basic-cs` | ❌ | Não compila; `Result.Combine` não usado |
| `config-auth-core-full-cs` | ⚠️ | SKILL 24 linhas; RBAC simples |
| `config-cicd-cs` | ✅ | Gate real (Coverlet + awk ≥95) |
| `config-db-seed-cs` | ⚠️ | Exemplo persiste entidade de domínio direto no `DbSet` |
| `config-docker-cs` | ✅ | Multi-stage + não-root |
| `config-efcore-cs` | ⚠️ | Pacotes inexistentes (Design/Relational); real = provider Npgsql |
| `config-new-module-cs` | ⚠️ | Template placeholder |
| `config-project-cs` | ⚠️ | `Result.cs` com sintaxe futura (não compila .NET 8) |
| `config-shared-core-cs` | ⚠️ | `Result.cs` duplicado (`ResultImproved.cs`) |
| `core-domain-service-cs` | ✅ | |
| `core-dto-cs` | ✅ | |
| `core-entity-cs` | ✅ | `Result.Combine` múltiplo |
| `core-query-cqrs-cs` | ✅ | |
| `core-repository-cs` | ✅ | Sem vazar IQueryable |
| `core-use-case-cs` | ✅ | Propaga `Errors` |
| `core-value-object-cs` | ⚠️ | Falha na 1ª regra; sem códigos |
| `test-e2e-cs` | ✅ | |
| `test-unit-cs` | ✅ | |

→ Corrigir templates auth (`Result.Errors` real, JWT .NET 8 com biblioteca correta); remover sintaxe futura do `config-project-cs`.

### 3.3 Java (`-java`)

| Skill | Status | Observação |
|-------|--------|-----------|
| `backend-controller-java` | ⚠️ | Sem exemplo de map `Result<DomainError>` → 400 com lista |
| `backend-data-java` | ✅ | JPA entity separada |
| `config-cicd-java` | ⚠️ | Sem YAML concreto/gate |
| `config-docker-java` | ⚠️ | Sem Dockerfile reference |
| `config-jpa-java` | ✅ | `validate` + Flyway |
| `config-new-module-java` | ⚠️ | Controller devolve entidade + 200 (não 201) |
| `config-project-java` | ✅ | Gradle multi-module, porta 4000 |
| `config-shared-core-java` | ✅ | `Result` + `List<DomainError>` + `mergeErrors` |
| `core-dto-java` | ✅ | Records Java 21 |
| `core-entity-java` | ✅ | `mergeErrors` |
| `core-domain-service-java` | ✅ | |
| `core-query-cqrs-java` | ✅ | |
| `core-repository-java` | ✅ | |
| `core-use-case-java` | ✅ | DI do port |
| `core-value-object-java` | ✅ | |
| `test-e2e-java` | ✅ | |
| `test-unit-java` | ✅ | |

→ `config-docker`/`config-cicd` sem referências de template; `config-new-module-java` restan devolver DTO + 201 + envelope.

---

## 4. Frontend e mobile (framework skills)

**Achados globais**
1. **5 stacks perdem a lista de erros no adaptador HTTP**: Angular (`e.error?.message`), Vue (`body.message`), Leptos (`DomainError::external` único), Flutter (`Failure('Erro...')`), Android (`e.message`). → parsear `{errors:[...]}`.
2. **Use cases dentro de `domain/`** (Angular/Vue/Flutter/Android) devem estar em `application/`.
3. **Frontmatter `stack:` inconsistente** (Angular/Vue `typescript`, Flutter `agnostic`, etc.).
4. **Cobertura de testes nula** no frontend/mobile.
5. **SKILL.md vs references contraditórios** (`frontend-page-angular`, `frontend-page-vue`).

### 4.1 Angular
`frontend-repository-angular` ⚠️ **Alta** — lista colapsada (`e.error?.message`), `findByEmail` faz GET-all + filtro em memória. Demais skill essencialmente OK (entity/usecase/page/form com pequenas inconsistências: genéricos, `card` custom ⇒  Tailwind).

### 4.2 Vue
`frontend-repository-vue` ⚠️ **Alta** — `apiRequest` extrai `body.message` (string única). `frontend-page-vue` Guidelines contradiz pattern (service HTTP vs store→UseCase).

### 4.3 Leptos (Rust web)
- `frontend-usecase/principal-repository/page/form-leptos` ⚠️ **Alta** — **exemplos não-compiláveis** (`if let Ok(...)`, `map_err(?)` sobre `Result`, `Vec::<DomainError>::new()`, strings sem import). `DomainError::external` colapsa lista.
- `frontend-entity-leptos` ✅ estrutura, mas exemplos não compilam.
→ Corrigir exemplos p/ Rust válido + parsear body de erro do backend.

### 4.4 Flutter
`mobile-repository-flutter` ❌ **Crítico** — `update()` e `delete()` são **stubs** (chamam `create()` e `findById()`), `ICustomerRemoteDataSource` não define update/delete, erros HTTP colapsados. → Implementar PUT/DELETE reais.
> As demais (entity, usecase, screen, form) OK.

### 4.5 Android
`mobile-entity-android` ⚠️ fail-fast, sem lista acumulada. `mobile-repository-android` ⚠️ `e.message.contains("404")` frágil; erros mono-mensagem. Demais OK.

---

## 5. Requisitos / OpenSpec / Workflow (agnostic)

- **`req-*`**: ✅ OK — fluxo completo (discovery → diagnóstico DDD → migração → planning), backlog com prefixos corretos. **Falta Leptos** na tabela de mapeamento; typos menores.
- **OpenSpec**: `propose`/`explore`/`archive`/`sync-specs`/`validate` ✅; `apply-change` ⚠️ não conhece Agents do backlog nem força DoD de épico; `context-cache` ❌ sem frontmatter (loader descarta) — *remover ou refazer*.
- **Workflow/Utils**: `git-organized-commits` ✅ (commits atômicos, sem `add .`); `config-project-fullstack` ✅ (matriz completa).

---

## 6. Ações recomendadas — Top 10 (por prioridade de impacto)

1. **Kotlin auth templates** (basic/full/backend): migrar de `kotlin.Result` para `DomainResult` + erros acumulados — ❌.
2. **C# auth templates**: usar `Result.Errors` real + JWT .NET 8 correto; `config-project-cs` sem sintaxe futura — ❌.
3. **Pasta `api/`**: remover resíduo C# sem SKILL — ❌.
4. **Rust `config-docker-rs`**: criar Dockerfile multi-stage completo.
5. **Flutter `mobile-repository-flutter`**: implementar `update`/`delete` reais.
6. **`config-cicd` (TS)**: `check-coverage.mjs` falha quando `matched===0`; `config-cicd-kt`: gate JaCoCo real.
7. **`core-value-object` (TS/KT/CS)**: acumular todas as top-válidas antes de falhar.
8. **Adapters HTTP (5 stacks)**: parsear lista `{errors:[...]}`.
9. **Leptos + `-rs`**: corrigir exemplos para Rust compilável.
10. **`openspec-apply-change`** (override local) + remover `openspec-context-cache`.

---


## 7. Verificação pós-fix (2026-09-07, mesmo dia)

Re-leitura de todos os itens ❌/⚠️ do relatório original após os 8 commits de correção (auth-kt, auth-cs, rust, ts, frontend-mobile, leptos, openspec-java):

| Achado original | Status | Evidência verificada |
|------------------|--------|----------------------|
| `api/` resíduo C# | ✅ Removida | pasta inexistente |
| `config-auth-*-kt` (kotlin.Result) | ✅ Migrado | `DomainResult` + `errors` acumulando em basic/full/backend |
| `config-auth-*-cs` (não compila) | ✅ Corrigido | `Result<T>.Errors` + JWT .NET 8 real |
| `mobile-repository-flutter` (stubs update/delete) | ✅ Corrigido | `_dio.put`/`_dio.delete` reais + checklist "sem stubs" |
| `openspec-context-cache` (sem frontmatter) | ✅ Corrigido | frontmatter `name/stack/description` presente |
| `config-docker-rs` (sem Dockerfile) | ✅ Corrigido | Dockerfile multi-stage + compose.prod + não-root + HEALTHCHECK |
| `config-cicd` (coverage fake-pass) | ✅ Corrigido | `check-coverage.mjs` falha quando `matched === 0` |
| `config-cicd-kt` (gate JaCoCo decorativo) | ✅ Corrigido | `jacocoTestCoverageVerification` real + fallback parse jacoco.xml |
| `core-value-object` TS (throw early-return) | ✅ Corrigido | `errors.push(...)` + `Result.fail(errors)` no final |
| Adapters HTTP Angular/Vue/Leptos/Flutter/Android (colapsam lista) | ✅ Corrigido | parse `{errors:[...]}` + fallback; testes unitários |
| Leptos (exemplos não compilam) | ✅ Corrigido | `match`/`?` válidos; `parse_api_errors` preserva lista |
| `core-query-cqrs-rs` (trait Query inexistente) | ✅ Corrigido | usa `shared_kernel::UseCase` (sem trait dedicado) |
| `config-shared-core-rs` (`errors()` ref temporária) | ✅ Corrigido | `const NO_ERRORS: &[DomainError]` |
| `config-new-module-rs` (código gerado não compila) | ✅ Corrigido | workflow valida com `cargo check -p api` |
| `backend-controller-java`/`config-new-module-java` (sem 201/envelope) | ✅ Corrigido | `201 Created` + `{ "errors": [...] }` + DTO |
| `openspec-apply-change` (sem DoD/Agents) | ✅ Corrigido | valida DoD de épico + delega Agents do backlog |
| `config-efcore-cs` (pacotes inexistentes) | ✅ Corrigido | provider `Npgsql.EntityFrameworkCore.PostgreSQL` |
| `config-docker` TS (npm ci antes de COPY) | ✅ Corrigido | `COPY package*.json` + `npm ci` após manifests |
| E2E web no CI (`config-cicd`) | ✅ Já presente | job `e2e-web` (Playwright, cache browsers) |
| `mobile-repository-android` (404 por contains) | ✅ Corrigido | map por status code + propaga `errors` como lista |
| `config-docker-kt` (EXPOSE 8080 vs 4000) | ✅ Corrigido (nesta verificação) | `EXPOSE 4000` + porta 4000 |
| Kotlin `core-*/backend-*` (kotlin.Result / mapOf("error")) | ✅ Corrigido (nesta verificação) | `DomainResult` + `{ "errors": result.errors }` + fold→DomainResult |
| Use cases mobile em `domain/` (Flutter/Android) | ✅ Corrigido (nesta verificação) | `features/<bc>/application/usecase(s)/` |
| `config-auth-core-full-cs` (SKILL 24 linhas) | ✅ Corrigido (nesta verificação) | Guidelines + Workflow 4 passos + NÃO FAZER |
| `config-new-module-cs` (placeholder) | ✅ Corrigido (nesta verificação) | pastas apontam para `core-use-case-cs`/`core-dto-cs` + exemplo mínimo no scaffold |
| `config-db-seed-cs` (entidade direto no DbSet) | ✅ Corrigido (nesta verificação) | `UserSeed.cs` completo com mapeamento domínio → `UserDbo` |
| `req-agile-planning` (sem Leptos na tabela) | ✅ Corrigido (nesta verificação) | matriz de stack + tabela + notas Leptos/Dioxus |

**Pendências conhecidas (não-bloqueantes):**
- `config-project` (TS): `images.remotePatterns` com `hostname: "**"` — decisão de produto documentada no audit original (tradeoff: apps reais precisam de imagens remotas; restringir hosts exige manutenção por projeto).
- Frontmatter `stack:` de mobile Flutter segue `agnostic` (cosmético; consumido por tooling sem impacto funcional).

---

## 8. Skills Dioxus (Rust mobile) — auditoria (lacuna do relatório original)

O relatório original não cobria a família Dioxux (adicionada em `feat(dioxus)` no mesmo dia). Auditoria de 9 skills — Clean Architecture por feature (`domain`/`application`/`infrastructure`/`presentation`) com `shared_kernel::Result<T>` (`Err(Vec<DomainError>)`):

| Skill | Status | Observação |
|-------|--------|-----------|
| `core-dioxus-screen-rs` | ✅ | UI (`#[component]`) separada de hooks/use cases; sem HTTP direto; renderiza **toda** a lista de erros (`<For>`) |
| `core-dioxus-widget-rs` | ✅ | Props tipadas; presentation pura (sem conhecer use cases/repositories) |
| `core-dioxux-navigation-rs` | ✅ | Rotas tipadas (enum `Route` + `Routable`), guards leem estado de auth (`core-dioxux-state-rs`); deep linking |
| `core-dioxux-state-rs` | ✅ | `use_signal` + `use_context`; stores expõem `Result` (sem exceptions); persistência local |
| `core-dioxux-native-access-rs` | ⚠️→✅ | Ports retornavam `Result<T, DomainError>` (erro único) — corrigido nesta auditoria para `shared_kernel::Result<T>` (`Err(Vec<DomainError>)`, §5.1); mocks em `#[cfg(test)]` |
| `backend-dioxux-api-client-rs` | ✅ | Cliente tipado (reqwest); preserva `{ errors: [...] }` como `ApiError::External(Vec<String>)`; retry + caching |
| `config-mobile-dioxux-rs` | ⚠️→✅ | Env var inconsistente (`DUX_BASE_URL`/`API_BASE_URL`/`DEFAULT_BASE_URL`) e comando stale (`config/dioxux-mobile/...`) — corrigidos: `DUX_API_BASE_URL` (runtime) + `DEFAULT_BASE_URL` (compile-time) + `project-init-dioxux.mjs` |
| `config-dioxux-cicd-rs` | ✅ | fmt/clippy/test/`llvm-cov` ≥95% domain+application; build Android (AAB) e iOS (IPA); assinatura via secrets; release só em tag; herda memory-check de `config-cicd-rs` |
| `test-dioxux-unit-rs` | ✅ | domain+application ≥95% + componentes (`dioxux-testing`); mocks `mockall`/fake — nunca device code |
| `test-dioxux-e2e-rs` | ✅ | Fluxos críticos (login, listagem, CRUD, guard de rota) contra API real/stub; verifica contrato `{ errors: [...] }` na UI |
| `config-fullstack-rust-rs` | ✅ | Monorepo Axum + Leptos + Dioxux; Shared Kernel compartilhado; clientes HTTP gerados das rotas; **nunca** duplicar tipos de domínio no cliente |

**Pontos fortes da família Dioxux:** contrato de erros único (`shared_kernel`), camadas isoladas, ports & adapters com mocks, DoD completo (unit ≥95% + E2E + CI + memory-check).

**Achados corrigidos nesta auditoria:** `core-dioxux-native-access-rs` (Result com lista) e `config-mobile-dioxux-rs` (env var + comando stale) — ambos já verificados como resolvidos.



*Relatório gerado em 2026-09-07 como parte da auditoria completa do repositório de skills DDD/Clean Architecture; verificação pós-fix e auditoria Dioxux adicionadas no mesmo dia.*
