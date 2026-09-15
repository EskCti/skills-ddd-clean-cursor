---
name: pos-tarefa
description: "Tarefa Jira do POS (FA-XXX): proposta OpenSpec primeiro, aprovação, depois implementação — com ADR/README atualizados"
---

Implemente a tarefa Jira <FA-XXX> (passada em <entrada fornecida pelo usuário na solicitação>) no módulo POS do projeto fritta, SEM consultar GitHub (sem PR, sem review). O fluxo é SEMPRE: **proposta OpenSpec primeiro → aprovação do usuário → só então implementação**.

**Fluxo obrigatório:**

1. **Pegar a tarefa via MCP Atlassian**: `jira_get_issue` com a key (summary, description, acceptance criteria, comments, links). Se a key não vier em <entrada fornecida pelo usuário na solicitação>, pergunte.

2. **Contexto obrigatório**:
   - Ler `docs/adr-pos-acquirer.md` — fonte de verdade do POS (PagBank/Moderninha Smart 2, Clean/Hexagonal, portas de domínio, constraints)
   - Ler `pos/CLAUDE.md` (stack e comandos do app)
   - Ler specs OpenSpec relacionadas, se existirem (`openspec/specs/pos-*`, `openspec/changes/*`)
   - Ler o código existente de `pos/app` para seguir o estilo (camadas domain/application/infrastructure/ui, Koin, ktlint)

3. **PROPOSTA OpenSpec — primeiro passo do trabalho**:
   - Crie a change com `/opsx-propose` (ou a skill `openspec-propose`), nome kebab-case derivado da tarefa (ex.: `fa-517-catalogo-pos`)
   - **Se já existir uma change correspondente** (mesma tarefa/épico, ex.: `pos-app-shell-ci`), ESTENDA a change existente (atualize os artefatos dela) — só crie uma nova se o usuário preferir
   - A proposta deve cobrir: proposal (o que/porquê), specs delta, design (como, respeitando o ADR), tasks (passos de implementação)
   - **Inclua SEMPRE uma task explícita de documentação**: "atualizar `docs/adr-pos-acquirer.md` e `README.md` com os casos de uso/portas alterados" — se a tarefa não mudar casos de uso, a proposta deve declarar isso e a task vira "verificar que ADR/README não precisam de atualização"
   - Mostre o resumo da proposta (artefatos criados, decisões de design, tasks)

4. **PARAR E AGUARDAR APROVAÇÃO DA PROPOSTA**:
   - Exiba a proposta e pergunte explicitamente se aprova
   - **O resumo da proposta DEVE destacar "mudança de casos de uso: SIM/NÃO"** e, se SIM, quais casos/portas e o impacto no `adr-pos-acquirer.md` — você aprova sabendo se a documentação será alterada
   - NÃO implemente nada, NÃO edite código, NÃO toque em arquivos além dos artefatos da proposta
   - "Sempre tenho que aprovar" — sem aprovação, o fluxo morre aqui

5. **IMPLEMENTAÇÃO — só depois da aprovação**:
   - Rode `/opsx-apply` (ou a skill `openspec-apply-change`) na change aprovada
   - Implemente task a task seguindo o ADR: domínio puro (sem Android/Retrofit), use cases na camada application dependendo só de portas, adapters na borda (Retrofit/OkHttp/EncryptedSharedPreferences), Koin ligando, zero logs de token
   - Marque `- [x]` conforme cada task completa
   - Na task de documentação: atualize `docs/adr-pos-acquirer.md` (casos de uso, portas, decisões afetadas — preservando o que não mudou) e `README.md` na raiz. Não deixe o FA-516 acontecer de novo: tarefa implementada sem ADR/README atualizados é entrega incompleta
   - Adicione testes para os novos casos (regra: caso novo sem teste = não terminado)

6. **Verificar**: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk ANDROID_HOME=$HOME/Android/Sdk ./gradlew :app:assembleDebug :app:ktlintCheck :app:testDebugUnitTest --no-daemon` em `pos/app`.

7. **Resumo + aprovação para commitar**: exiba o resumo (tasks concluídas, arquivos, testes, ADR/README atualizados) e PEÇA APROVAÇÃO antes do commit. Commit conventional em português (`feat(pos): ...`), staging seletivo (nunca `git add .`), atômico por área, branch `feature/*` a partir de `develop` (Gitflow). Push só após aprovação.

**Guardrails:**
- Proposta SEMPRE antes de código; implementação SEMPRE depois de aprovação explícita da proposta
- Não commitar sem aprovação explícita (nem proposta, nem commit)
- Não alterar partes do ADR/README não afetadas pela tarefa
- Todo código em inglês; UI/strings em português (i18n via strings.xml)
- Money sempre Long em centavos; IDs tipados; soft delete `deleted_at`
- Sem comentários em código desnecessários
