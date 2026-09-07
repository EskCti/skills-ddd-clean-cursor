---
name: openspec-context-cache
stack: agnostic
description: Gerenciar cache de contexto por change_id no fluxo OpenSpec. Usar quando o pedido envolver cache de contexto, persistência de contexto entre changes, ou otimização de contexto OpenSpec.
---

# OpenSpec Context Cache

Gerenciar cache de contexto compartilhado entre skills durante o ciclo OpenSpec, isolado por `change_id`.

**Propósito**: Evitar recálculos e manter consistência entre tasks de uma mesma mudança, compartilhando contexto (value objects, decisões de stack, dados calculados) entre skills sem duplicar trabalho.

**Quando usar**:
- Ao iniciar a implementação de uma change com várias tasks (preparar o cache).
- Durante `openspec-apply-change`, ao delegar tasks para agents (gravar e reutilizar contexto).
- Ao arquivar uma change (`openspec-archive-change`), liberar o cache.

---

## Entrada

- `change_id`: identificador da change (ex.: `ep-001-auth`). Usar o nome resolvido em `openspec status --change "<nome>" --json`.
- Se omitido, inferir do contexto da conversa; se ambíguo, executar `openspec list --json` e perguntar.

---

## Fluxo de trabalho

1. **Resolver o `change_id`** — usar o nome da change (ou inferido do contexto).
2. **Preparar o cache** — ao iniciar a implementação, carregar o contexto já resolvido (stack, configuração de BC, dependency graph) antes de executar qualquer task.
3. **Ler antes de calcular** — para cada dado compartilhado (value object, entidade, configuração, grafo de dependências), verificar o cache antes de recalcular.
4. **Gravar ao calcular** — quando uma task calcula um dado, persistir no cache da change para reutilização nas próximas tasks.
5. **Liberar ao finalizar** — ao arquivar a change, liberar o cache para não vazar contexto entre mudanças.

---

## Escopo do cache (por change)

| Domínio | Exemplo de chave | Descrição |
|---------|------------------|-----------|
| Domínio compartilhado | `vo:email`, `vo:cpf` | Value objects reutilizáveis entre skills |
| Configuração do projeto | `project:stack`, `project:tenant-strategy`, `project:auth-provider` | Decisões tomadas no planejamento |
| Configuração de BC | `bc:auth`, `bc:catalog` | Configurações por Bounded Context |
| Dados calculados | `dependency-graph`, `task-order` | Resultados reutilizáveis entre skills |

Regras para chaves:

- Escopar toda chave pelo `change_id`; contexto de uma mudança não vaza para outra.
- Uma única chave por conceito — reutilizar em vez de duplicar.

---

## Workflow otimizado com cache

| Abordagem | Comportamento |
|-----------|---------------|
| Antes (sem cache) | Skill A calcula o EmailVO e armazena localmente; Skills B e C recalculam o mesmo EmailVO |
| Depois (com cache) | Skill A calcula e persiste; Skills B e C reutilizam o valor já gravado |

Junto com `openspec-apply-change`, o cache permite que dados idênticos não sejam recalculados entre os agents acionados nas tasks (`**Agent:**` / `**Prompt:**` do backlog DDD).

---

## Integração com outras skills

| Skill | Papel do cache |
|-------|----------------|
| `openspec-propose` | Registrar os dados compartilhados que a change usará de cache |
| `openspec-apply-change` | Preparar o cache antes de implementar; reutilizar contexto ao delegar cada task ao Agent |
| `openspec-validate-dependencies` | Reutilizar o `dependency-graph` em vez de recomputar a ordem de implementação |
| `openspec-archive-change` | Liberar o cache ao concluir a mudança |

---

## Regras

- **Nunca** armazenar segredos (senhas, tokens, credenciais) no cache.
- Scopar o cache por `change_id`; não compartilhar contexto entre mudanças.
- Dados cacheados devem refletir a change atual; se `spec.md`, `design.md` ou `tasks.md` mudarem, invalidar e recalcular.
- O cache é auxiliar: a fonte da verdade continua sendo os artefatos OpenSpec.

## Guardrails

- Verificar o cache antes de recalcular; não duplicar cálculo que já existe.
- Gravar no cache somente após o cálculo ser concluído — nunca gravar estado parcial.
- Recalcular se os dados cacheados estiverem desatualizados (spec/design alterados).
- Não usar o cache como fonte da verdade — artefatos OpenSpec prevalecem.

## Referências

- [OpenSpec Workflow](../../docs/tutorial/04-ciclo-completo-openspec.md)
- [Template de Tasks](../../docs/templates/openspec-task-template.yaml)
- [Dashboard de Progresso](../../docs/dashboard/openspec-progress-dashboard.md)

## Skills relacionadas

- `openspec-propose`
- `openspec-apply-change`
- `openspec-validate-dependencies`
- `openspec-archive-change`