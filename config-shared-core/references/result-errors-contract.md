# Result — lista de erros (contrato global)

Fonte canônica: [`skills-standards.md`](../../skills-standards.md) § **5.1 Result and validation errors**.

## Regra

- **Falha**: `errors` é sempre uma **lista** (nunca depender só do primeiro `throw` / `Exception` opaca).
- **Sucesso**: lista vazia.
- **Entidade**: validar todos os VOs → **combinar** listas → um único `Result` falho com todos os itens.
- **UI (frontend + mobile)**: exibir **todas** as mensagens (lista, bullets ou `Message` por item) — não truncar para a primeira.

## Por stack

| Stack | Domínio / combine | Exibição na UI |
|-------|-------------------|-----------------|
| TypeScript | `Result.combine([r1, r2, …])` | `getErrorMessage({ errors })` em `config-shared-web` |
| Kotlin | `DomainResult.combine(…)` | API `{ errors: [...] }` → componente lista |
| C# | `Result<T>.Combine(r1, r2, r3)` | idem |
| Rust | `combine2` / `Vec` | idem |
| Java | `Result.mergeErrors(r1, r2, …)` | idem |
| Angular / Vue | `err(string[])` no `Result` local | `errors = signal<string[]>([])` + `@for` / `v-for` |
| Flutter | `Failure(List<String> messages)` | `Column` com `messages.map` |
| Android | `kotlin.Result` no use case | `UiState.Error(messages: List<String>)` + `forEach` |

Skills: `core-entity*`, `core-value-object*`, `config-shared-core*`, `frontend-*`, `mobile-*`.
