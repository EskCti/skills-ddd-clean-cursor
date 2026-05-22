---
name: openspec-propose
stack: agnostic
description: Propose a new change with all artifacts generated in one step. Use when the user wants to quickly describe what they want to build and get a complete proposal with design, specs, and tasks ready for implementation.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: '1.0'
  generatedBy: '1.2.0'
---

Propose a new change - create the change and generate all artifacts in one step.

I'll create a change with artifacts:

- proposal.md (what & why)
- design.md (how)
- tasks.md (implementation steps)

When ready to implement, run /opsx:apply

---

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:

   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → `add-user-auth`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Create the change directory**

   ```bash
   openspec new change "<name>"
   ```

   This creates a scaffolded change at `openspec/changes/<name>/` with `.openspec.yaml`.

3. **Get the artifact build order**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse the JSON to get:
   - `applyRequires`: array of artifact IDs needed before implementation (e.g., `["tasks"]`)
   - `artifacts`: list of all artifacts with their status and dependencies

4. **Create artifacts in sequence until apply-ready**

   Use the **TodoWrite tool** to track progress through the artifacts.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is `ready` (dependencies satisfied)**:
   - Get instructions:
     ```bash
     openspec instructions <artifact-id> --change "<name>" --json
     ```
   - The instructions JSON includes:
     - `context`: Project background (constraints for you - do NOT include in output)
     - `rules`: Artifact-specific rules (constraints for you - do NOT include in output)
     - `template`: The structure to use for your output file
     - `instruction`: Schema-specific guidance for this artifact type
     - `outputPath`: Where to write the artifact
     - `dependencies`: Completed artifacts to read for context
   - Read any completed dependency files for context
   - Create the artifact file using `template` as the structure
   - Apply `context` and `rules` as constraints - but do NOT copy them into the file
   - Show brief progress: "Created <artifact-id>"

   b. **Continue until all `applyRequires` artifacts are complete**
   - After creating each artifact, re-run `openspec status --change "<name>" --json`
   - Check if every artifact ID in `applyRequires` has `status: "done"` in the artifacts array
   - Stop when all `applyRequires` artifacts are done

   c. **If an artifact requires user input** (unclear context):
   - Use **AskUserQuestion tool** to clarify
   - Then continue with creation

5. **Show final status**
   ```bash
   openspec status --change "<name>"
   ```

**Output**

After completing all artifacts, summarize:

- Change name and location
- List of artifacts created with brief descriptions
- What's ready: "All artifacts created! Ready for implementation."
- Prompt: "Run `/opsx:apply` or ask me to implement to start working on the tasks."

**Artifact Creation Guidelines**

- Follow the `instruction` field from `openspec instructions` for each artifact type
- The schema defines what each artifact should contain - follow it
- Read dependency artifacts for context before creating new ones
- Use `template` as the structure for your output file - fill in its sections
- For `tasks.md`: read `delivery-profile.md`, `backlog.md`, and `modeling/<projeto>/ddd-tactical-model.md` (seções **Apresentação — Web/Mobile** + subseções **Telas e fluxos** das US) — each task must include prefix, **Agent**, and **Prompt**. Omit web/mobile tasks only when delivery-profile marks that surface as **Nenhum**
- **Expandir template full-stack**: se o backlog tiver “Template full-stack” ou só `interface:page` sem entity/usecase/repository, **expandir** usando o template em `docs/planning/*/backlog.md` (seção “Template — Tasks full-stack”) e o checklist em `req-agile-planning` — **nunca** copiar uma única task genérica para web/mobile
- **Ordem no `tasks.md`**: backend inside-out primeiro; depois bloco Vue (`interface:entity` → … → `interface:form-web`); depois bloco mobile (`interface:mobile-entity` → …); por último `test:unit`/`test:e2e` (API) e `test:unit-web`/`test:unit-mobile` se existirem no backlog
- Se a change já foi aplicada parcialmente (MVP), adicionar seção nova (ex. “§12 Frontend CA”) com tasks `[ ]` em vez de reescrever o histórico `[x]` do backend
- **IMPORTANT**: `context` and `rules` are constraints for YOU, not content for the file
  - Do NOT copy `<context>`, `<rules>`, `<project_context>` blocks into the artifact
  - These guide what you write, but should never appear in the output

**Guardrails — validação de `tasks.md` antes de finalizar**

Executar mentalmente o checklist de `req-agile-planning` (“BC com web e/ou mobile”). Se faltar camada, **inserir tasks** antes de marcar propose como concluído.

| Erro comum | Correção |
|------------|----------|
| Só `Frontend Page (Vue)` no auth | Adicionar `Frontend Entity`, `Frontend UseCase`, `Frontend Repository` antes da page; prompts devem citar rotas da US (**Telas e fluxos**) |
| Backlog sem **Telas e fluxos (web/mobile)** | Completar US no backlog ou `ddd-tactical-model` antes de propor |
| “Template full-stack” em uma linha | Expandir 8–12 tasks mobile + 5–7 tasks web |
| Só `Unit Tests (C#)` no épico full-stack | Adicionar `test:unit-web` e/ou `test:unit-mobile` quando houver apps web-vue / mobile-android |

**Guardrails**

- Create ALL artifacts needed for implementation (as defined by schema's `apply.requires`)
- Always read dependency artifacts before creating a new one
- If context is critically unclear, ask the user - but prefer making reasonable decisions to keep momentum
- If a change with that name already exists, ask if user wants to continue it or create a new one
- Verify each artifact file exists after writing before proceeding to next

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
