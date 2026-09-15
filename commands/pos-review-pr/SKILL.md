---
name: pos-review-pr
description: "Review de PR do POS (GitHub) + Jira: proposta OpenSpec das correções primeiro, aprovação, depois implementação — ADR/README atualizados"
---

Trate a review do PR <NÚMERO> (passado em <entrada fornecida pelo usuário na solicitação>) do projeto fritta, módulo POS, usando MCP Atlassian e MCP GitHub. O fluxo é SEMPRE: **proposta OpenSpec das correções primeiro → aprovação do usuário → só então implementação**.

**Fluxo obrigatório:**

1. **Pegar o PR via MCP GitHub**: `pull_request_read` com `get` (título, descrição, base/head, estado) + `get_review_comments` (comentários inline por linha) + `get_reviews` (estado: APPROVED/CHANGES_REQUESTED/COMMENTED) + `get_comments` (comentários gerais). Liste TUDO, incluindo threads resolvidas e adendos.

2. **Tarefa Jira associada via MCP Atlassian**: identifique a key no título/descrição (ex.: FA-516) e busque com `jira_get_issue` (critérios de aceite, contexto, comments). Se não houver key, pergunte ao usuário.

3. **Classificar os comentários da review**:
   - ✅ **Partes aprovadas** (o revisor elogiou/validou): NÃO ALTERAR NADA — listar explicitamente na proposta
   - 🔴 **Bugs/correções**: entram na proposta
   - 🟠/🟡 **Melhorias/observações**: decidir com o usuário se entram
   - Contexto obrigatório antes de classificar: `docs/adr-pos-acquirer.md`, `pos/CLAUDE.md`, specs OpenSpec da change existente (ex.: `openspec/changes/pos-app-shell-ci`), código de `pos/app`

4. **PROPOSTA OpenSpec — primeiro passo do trabalho**:
   - Crie a change com `/opsx-propose` (ou a skill `openspec-propose`), nome kebab-case derivado da review (ex.: `fix-pos-pr-742-review`)
   - **Se já existir uma change correspondente** (ex.: `pos-app-shell-ci` para o PR do shell), ESTENDA a change existente (atualize os artefatos dela) — só crie uma nova se o usuário preferir
   - A proposta deve cobrir: proposal (o que/porquê, com a classificação da review), specs delta, design (como, respeitando o ADR), tasks (uma por correção, incluindo o teste de regressão de cada uma)
   - **Inclua SEMPRE uma task explícita de documentação**: "atualizar `docs/adr-pos-acquirer.md` e `README.md` se as correções mudarem casos de uso/portas" — se nenhuma correção mudar casos de uso, a proposta deve declarar isso e a task vira "verificar que ADR/README não precisam de atualização"
   - Mostre o resumo da proposta (artefatos criados, decisões de design, tasks mapeadas para os comentários da review)

5. **PARAR E AGUARDAR APROVAÇÃO DA PROPOSTA**:
   - Exiba a proposta e pergunte explicitamente se aprova
   - **O resumo da proposta DEVE destacar "mudança de casos de uso: SIM/NÃO"** e, se SIM, quais casos/portas e o impacto no `adr-pos-acquirer.md` — você aprova sabendo se a documentação será alterada
   - NÃO implemente nada, NÃO edite código, NÃO toque em arquivos além dos artefatos da proposta
   - "Sempre tenho que aprovar" — sem aprovação, o fluxo morre aqui

6. **IMPLEMENTAÇÃO — só depois da aprovação**:
   - Rode `/opsx-apply` (ou a skill `openspec-apply-change`) na change aprovada
   - Implemente task a task seguindo o ADR (Clean/Hexagonal, portas no domínio, adapters na borda, Koin). Cada bug corrigido DEVE ganhar teste de regressão (ex.: "token existente → não chama a porta de pareamento")
   - Marque `- [x]` conforme cada task completa
   - Na task de documentação: se houve mudança de casos de uso/portas, atualize `docs/adr-pos-acquirer.md` e `README.md` — preservando o que não mudou; se não houve, declare explicitamente e justifique. Histórico de referência: o FA-516 foi entregue sem ADR/README atualizados — não repetir

7. **Verificar**: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk ANDROID_HOME=$HOME/Android/Sdk ./gradlew :app:assembleDebug :app:ktlintCheck :app:testDebugUnitTest --no-daemon` em `pos/app`. Validações práticas extras quando a review apontar bug de build/config (ex.: propriedade vazia, URL inválida).

8. **Comentar no PR (cobertura)**: via `gh pr comment <NÚMERO>` (ou MCP GitHub `add_issue_comment`), publique tabela de cobertura: suíte → testes → qual ponto da review cobre. Responda/replique threads dos comentários corrigidos quando fizer sentido.

9. **Resumo + aprovação para commit/push**: exiba resumo (correções, testes, ADR/README atualizados, partes aprovadas intactas) e PEÇA APROVAÇÃO. Commit conventional em português (`fix(pos): ...`), staging seletivo (nunca `git add .`), atômico por área. Push na MESMA branch do PR (head do PR). Push só após aprovação.

**Guardrails:**
- Proposta SEMPRE antes de código; implementação SEMPRE depois de aprovação explícita da proposta
- NUNCA alterar as partes que o revisor aprovou explicitamente (health, camadas, docs aprovados, wrapper, configs elogiadas)
- Não commitar sem aprovação explícita (nem proposta, nem commit/push)
- Não alterar partes do ADR/README não afetadas
- Todo código em inglês; UI/strings em português (strings.xml)
- Money sempre Long em centavos; IDs tipados; soft delete `deleted_at`
- Sem comentários em código desnecessários
